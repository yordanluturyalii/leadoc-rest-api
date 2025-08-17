export interface RepoAnalysis {
	name: string;
	description: string;
	language: string;
	dependencies: string[];
	devDependencies: string[];
	structure: string[];
	hasDockerfile: boolean;
	hasTests: boolean;
	hasCI: boolean;
	license: string | null;
	topics: string[];
	stars: number;
	forks: number;
	size: number;
	defaultBranch: string;
	homepage: string | null;
	hasWiki: boolean;
	hasPages: boolean;
	packageManager: string;
	scripts: Record<string, string>;
	environment: string[];
	apiEndpoints: string[];
}
