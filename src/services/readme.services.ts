import { Octokit } from "octokit";
import type { RepoAnalysis } from "../utils/constant.util";
import { logger } from "../utils/logger.utils";

export class ReadmeServices {
    private octokit: Octokit;

    constructor(token: string) {
        this.octokit = new Octokit({
            auth: token,
        });
    }

    async analyzeRepository(owner: string, repo: string): Promise<RepoAnalysis> {
        try {
            const { data: repoData } = await this.octokit.rest.repos.get({
                owner,
                repo,
            });

            const { data: contents } = await this.octokit.rest.repos.getContent({
                owner,
                repo,
                path: '',
            });

            const structure = this.analyzeFileStructure(contents as any);

            const { dependencies, devDependencies, packageManager, scripts } = await this.extractDependencies(owner, repo);

            const hasDockerfile = structure.some(file => file.toLowerCase() === 'dockerfile');
            const hasTests = structure.some(file =>
                file.includes('test') || file.includes('spec') || file.includes('__tests__')
            );
            const hasCI = await this.checkCIConfiguration(owner, repo);

            const environment = await this.extractEnvironmentVariables(owner, repo);

            const apiEndpoints = await this.extractAPIEndpoints(owner, repo);

            return {
                name: repoData.name,
                description: repoData.description || '',
                language: repoData.language || 'Unknown',
                dependencies,
                devDependencies,
                structure,
                hasDockerfile,
                hasTests,
                hasCI,
                license: repoData.license?.name || null,
                topics: repoData.topics || [],
                stars: repoData.stargazers_count,
                forks: repoData.forks_count,
                size: repoData.size,
                defaultBranch: repoData.default_branch,
                homepage: repoData.homepage,
                hasWiki: repoData.has_wiki,
                hasPages: repoData.has_pages,
                packageManager,
                scripts,
                environment,
                apiEndpoints,
            };
        } catch (error) {
            console.error('Error analyzing repository:', error);
            throw new Error(`Failed to analyze repository: ${owner}/${repo}`);
        }
    }


    public analyzeFileStructure(contents: any[]): string[] {
        return contents
            .filter(item => item.type === 'file')
            .map(item => item.name)
            .slice(0, 20);
    }

    public async extractDependencies(owner: string, repo: string): Promise<{
        dependencies: string[];
        devDependencies: string[];
        packageManager: string;
        scripts: Record<string, string>;
    }> {
        const dependencyFiles = [
            'package.json',
            'requirements.txt',
            'Pipfile',
            'poetry.lock',
            'go.mod',
            'Cargo.toml',
            'pom.xml',
            'build.gradle',
            'composer.json',
            'Gemfile',
        ];

        let dependencies: string[] = [];
        let devDependencies: string[] = [];
        let packageManager = 'unknown';
        let scripts: Record<string, string> = {};

        for (const file of dependencyFiles) {
            try {
                const { data } = await this.octokit.rest.repos.getContent({
                    owner,
                    repo,
                    path: file,
                });

                if ('content' in data) {
                    const content = Buffer.from(data.content, 'base64').toString('utf-8');
                    const result = this.parseDependencies(file, content);
                    dependencies.push(...result.dependencies);
                    devDependencies.push(...result.devDependencies);

                    if (result.packageManager !== 'unknown') {
                        packageManager = result.packageManager;
                    }

                    if (Object.keys(result.scripts).length > 0) {
                        scripts = { ...scripts, ...result.scripts };
                    }
                }
            } catch (error) {
                continue;
            }
        }

        return {
            dependencies: [...new Set(dependencies)],
            devDependencies: [...new Set(devDependencies)],
            packageManager,
            scripts,
        };
    }

    public parseDependencies(filename: string, content: string): {
        dependencies: string[];
        devDependencies: string[];
        packageManager: string;
        scripts: Record<string, string>;
    } {
        try {
            switch (filename) {
                case 'package.json':
                    const packageJson = JSON.parse(content);
                    return {
                        dependencies: Object.keys(packageJson.dependencies || {}),
                        devDependencies: Object.keys(packageJson.devDependencies || {}),
                        packageManager: 'npm',
                        scripts: packageJson.scripts || {},
                    };

                case 'requirements.txt':
                    const pythonDeps = content
                        .split('\n')
                        .filter(line => line.trim() && !line.startsWith('#'))
                        .map(line => {
                            const parts = line.split('==')[0]?.split('>=')[0];
                            return parts ? parts.trim() : '';
                        })
                        .filter(dep => dep.length > 0);
                    return {
                        dependencies: pythonDeps,
                        devDependencies: [],
                        packageManager: 'pip',
                        scripts: {},
                    };

                case 'Pipfile':
                    return {
                        dependencies: this.extractPipfileDeps(content),
                        devDependencies: this.extractPipfileDevDeps(content),
                        packageManager: 'pipenv',
                        scripts: {},
                    };

                case 'go.mod':
                    const goModules = content
                        .split('\n')
                        .filter(line => line.trim().startsWith('require'))
                        .map(line => {
                            const parts = line.split(' ');
                            return parts.length > 1 ? parts[1] : '';
                        })
                        .filter(module => typeof module === 'string' && module.length > 0);
                    return {
                        dependencies: goModules as string[],
                        devDependencies: [],
                        packageManager: 'go',
                        scripts: {},
                    };

                case 'Cargo.toml':
                    return {
                        dependencies: this.extractCargoDeps(content),
                        devDependencies: [],
                        packageManager: 'cargo',
                        scripts: {},
                    };

                default:
                    return {
                        dependencies: [],
                        devDependencies: [],
                        packageManager: 'unknown',
                        scripts: {},
                    };
            }
        } catch (error) {
            console.error(`Error parsing ${filename}:`, error);
            return {
                dependencies: [],
                devDependencies: [],
                packageManager: 'unknown',
                scripts: {},
            };
        }
    }

    public extractPipfileDeps(content: string): string[] {
        const matches = content.match(/\[packages\]([\s\S]*?)(\[|$)/);
        if (!matches || !matches[1]) return [];
        return matches[1].split('\n')
            .filter(line => line.includes('='))
            .map(line => {
                const parts = line.split('=');
                return parts.length > 0 ? parts[0]?.trim() || '' : '';
            })
            .filter(Boolean);
    }

    public extractPipfileDevDeps(content: string): string[] {
        const matches = content.match(/\[dev-packages\]([\s\S]*?)(\[|$)/);
        if (!matches || !matches[1]) return [];
        return matches[1].split('\n')
            .filter(line => line.includes('='))
            .map(line => {
                const parts = line.split('=');
                return parts.length > 0 ? parts[0]?.trim() || '' : '';
            })
            .filter(Boolean);
    }

    public extractCargoDeps(content: string): string[] {
        const matches = content.match(/\[dependencies\]([\s\S]*?)(\[|$)/);
        if (!matches || !matches[1]) return [];
        return matches[1].split('\n')
            .filter(line => line.includes('='))
            .map(line => {
                const parts = line.split('=');
                return parts.length > 0 ? parts[0]?.trim() || '' : '';
            })
            .filter(Boolean);
    }

    public async checkCIConfiguration(owner: string, repo: string): Promise<boolean> {
        const ciPaths = [
            '.github/workflows',
            '.gitlab-ci.yml',
            'circle.yml',
            '.circleci/config.yml',
            'azure-pipelines.yml',
            'Jenkinsfile',
        ];

        for (const path of ciPaths) {
            try {
                await this.octokit.rest.repos.getContent({
                    owner,
                    repo,
                    path,
                });
                return true;
            } catch (error) {
                continue;
            }
        }
        return false;
    }

    public async extractEnvironmentVariables(owner: string, repo: string): Promise<string[]> {
        const envFiles = ['.env.example', '.env.template', 'docker-compose.yml', 'Dockerfile'];
        const envVars: string[] = [];

        for (const file of envFiles) {
            try {
                const { data } = await this.octokit.rest.repos.getContent({
                    owner,
                    repo,
                    path: file,
                });

                if ('content' in data) {
                    const content = Buffer.from(data.content, 'base64').toString('utf-8');
                    const vars = this.parseEnvironmentVariables(content, file);
                    envVars.push(...vars);
                }
            } catch (error) {
                continue;
            }
        }

        return [...new Set(envVars)];
    }

    public parseEnvironmentVariables(content: string, filename: string): string[] {
        const vars: string[] = [];

        if (filename.startsWith('.env')) {
            const lines = content.split('\n');
            for (const line of lines) {
                const trimmed = line.trim();
                if (trimmed && !trimmed.startsWith('#')) {
                    const parts = trimmed.split('=');
                    const varName = parts[0]?.trim();
                    if (varName) vars.push(varName);
                }
            }
        } else if (filename === 'docker-compose.yml') {
            const envMatches = content.match(/- ([A-Z_]+[A-Z0-9_]*)/g);
            if (envMatches) {
                vars.push(...envMatches.map(match => match.substring(2)));
            }
        } else if (filename === 'Dockerfile') {
            const envMatches = content.match(/ENV\s+([A-Z_]+[A-Z0-9_]*)/g);
            if (envMatches) {
                vars.push(...envMatches.map(match => match.replace('ENV ', '')));
            }
        }

        return vars;
    }

    public async extractAPIEndpoints(owner: string, repo: string): Promise<string[]> {
        const endpoints: string[] = [];

        try {
            const apiFiles = ['routes', 'controllers', 'api', 'endpoints'];

            for (const dir of apiFiles) {
                try {
                    const { data: contents } = await this.octokit.rest.repos.getContent({
                        owner,
                        repo,
                        path: dir,
                    });

                    if (Array.isArray(contents)) {
                        for (const file of contents) {
                            if (file.type === 'file') {
                                const { data: fileData } = await this.octokit.rest.repos.getContent({
                                    owner,
                                    repo,
                                    path: file.path,
                                });

                                if ('content' in fileData) {
                                    const content = Buffer.from(fileData.content, 'base64').toString('utf-8');
                                    const apiEndpoints = this.parseAPIEndpoints(content);
                                    endpoints.push(...apiEndpoints);
                                }
                            }
                        }
                    }
                } catch (error) {
                    continue;
                }
            }
        } catch (error) {
        }

        return [...new Set(endpoints)];
    }

    public parseAPIEndpoints(content: string): string[] {
        const endpoints: string[] = [];

        const patterns = [
            // === JavaScript / TypeScript ===
            /app\.(get|post|put|delete|patch)\(['"`]([^'"`]+)['"`]/gi,
            /router\.(get|post|put|delete|patch)\(['"`]([^'"`]+)['"`]/gi,
            /@(Get|Post|Put|Delete|Patch)\(['"`]([^'"`]+)['"`]/gi,

            // === Python ===
            /@app\.route\(['"`]([^'"`]+)['"`],?\s*methods?=\[?(['"`A-Z, ]+)\]?/gi,
            /@(get|post|put|delete|patch)\(['"`]([^'"`]+)['"`]\)/gi,
            /path\(['"`]([^'"`]+)['"`],\s*.*\)/gi,
            /re_path\(['"`]([^'"`]+)['"`],\s*.*\)/gi,

            // === Java ===
            /@(GetMapping|PostMapping|PutMapping|DeleteMapping|PatchMapping)\(['"`]([^'"`]+)['"`]\)/gi,
            /@RequestMapping\(['"`]([^'"`]+)['"`],?\s*method\s*=\s*RequestMethod\.(GET|POST|PUT|DELETE|PATCH)\)/gi,

            // === PHP ===
            /Route::(get|post|put|delete|patch)\(['"`]([^'"`]+)['"`]/gi,
            /\$app->(get|post|put|delete|patch)\(['"`]([^'"`]+)['"`]/gi,

            // === Go ===
            /\.((GET|POST|PUT|DELETE|PATCH))\(['"`]([^'"`]+)['"`],/gi,

            // === Ruby ===
            /get ['"`]([^'"`]+)['"`]/gi,
            /post ['"`]([^'"`]+)['"`]/gi,
            /put ['"`]([^'"`]+)['"`]/gi,
            /delete ['"`]([^'"`]+)['"`]/gi,

            // === C# ===
            /\[Http(Get|Post|Put|Delete|Patch)\("([^"]+)"\)\]/gi,

            // === Kotlin ===
            /@(GetMapping|PostMapping|PutMapping|DeleteMapping|PatchMapping)\(['"`]([^'"`]+)['"`]\)/gi,

            // === Rust ===
            /#\[(get|post|put|delete|patch)\("([^"]+)"\)\]/gi,
            /routes::(get|post|put|delete|patch)\("([^"]+)"\)/gi,

            // === C++ ===
            /CROW_ROUTE\(\w+,\s*['"`]([^'"`]+)['"`]\)\.methods\((GET|POST|PUT|DELETE|PATCH)\)/gi,

            // === Elixir ===
            /get\s+['"`]([^'"`]+)['"`]/gi,
            /post\s+['"`]([^'"`]+)['"`]/gi,
            /put\s+['"`]([^'"`]+)['"`]/gi,
            /delete\s+['"`]([^'"`]+)['"`]/gi,

            // === Scala ===
            /GET\s+['"`]([^'"`]+)['"`]/gi,
            /POST\s+['"`]([^'"`]+)['"`]/gi,
            /PUT\s+['"`]([^'"`]+)['"`]/gi,
            /DELETE\s+['"`]([^'"`]+)['"`]/gi,
        ];

        for (const pattern of patterns) {
            let match;
            while ((match = pattern.exec(content)) !== null) {
                const method = (match[1] || match[2] || 'GET').toUpperCase();
                const path = match[2] || match[3] || match[1];
                endpoints.push(`${method} ${path}`);
            }
        }

        return endpoints;
    }

    async updateReadme(owner: string, repo: string, content: string): Promise<void> {
        try {
            let sha: string | undefined;

            try {
                const { data: currentReadme } = await this.octokit.rest.repos.getContent({
                    owner,
                    repo,
                    path: 'README.md',
                });

                if ('sha' in currentReadme) {
                    sha = currentReadme.sha;
                }
            } catch (error) {
                // README doesn't exist, will create new one
            }

            await this.octokit.rest.repos.createOrUpdateFileContents({
                owner,
                repo,
                path: 'README.md',
                message: sha ? 'Update README.md via Leadoc Apps' : 'Create README.md via Leadoc Apps',
                content: Buffer.from(content).toString('base64'),
                sha,
            });
        } catch (error) {
            console.error('Error updating README:', error);
            throw new Error('Failed to update README.md');
        }
    }
}
