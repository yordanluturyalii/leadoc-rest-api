import { Service } from "typedi";
import type { RepoAnalysis } from "../utils/constant.util";
import { logger } from "../utils/logger.utils";

@Service()
export class AIServices {
  static getAvailableSections() {
    return [
      { id: 'title', name: 'Title and Description', description: 'Project name and brief description', required: true, category: 'basic' }, // done
      { id: 'badges', name: 'Badges', description: 'Status badges (build, coverage, version, etc.)', required: false, category: 'basic' }, // done
      { id: 'installation', name: 'Installation', description: 'How to install and setup the project', required: true, category: 'basic' }, // done
      { id: 'usage', name: 'Usage', description: 'Basic usage examples and getting started', required: true, category: 'basic' }, // done
      { id: 'features', name: 'Features', description: 'Key features and capabilities', required: false, category: 'basic' }, // done

      { id: 'api-reference', name: 'API Reference', description: 'API endpoints and documentation', required: false, category: 'advanced' }, // done
      { id: 'environment', name: 'Environment', description: 'Required environment configuration', required: false, category: 'advanced' }, // done tp problem
      { id: 'deployment', name: 'Deployment', description: 'Deployment instructions and guides', required: false, category: 'advanced' }, // done
      { id: 'documentation', name: 'Documentation', description: 'Links to detailed documentation', required: false, category: 'advanced' },
      { id: 'testing', name: 'Running Tests', description: 'How to run tests and test coverage', required: false, category: 'advanced' }, // done

      { id: 'roadmap', name: 'Roadmap', description: 'Future plans and upcoming features', required: false, category: 'optional' },
      { id: 'contributing', name: 'Contributing', description: 'Guidelines for contributors', required: false, category: 'optional' },
      { id: 'license', name: 'License', description: 'License information', required: false, category: 'basic' }, //done
      { id: 'authors', name: 'Authors', description: 'Project authors and maintainers', required: false, category: 'optional' },
      { id: 'acknowledgments', name: 'Acknowledgments', description: 'Credits and thanks', required: false, category: 'optional' },
      { id: 'support', name: 'Support', description: 'How to get help and support', required: false, category: 'optional' },
      { id: 'faq', name: 'FAQ', description: 'Frequently asked questions', required: false, category: 'optional' }, // done
      { id: 'changelog', name: 'Changelog', description: 'Version history and changes', required: false, category: 'optional' },
      { id: 'security', name: 'Security', description: 'Security policies and vulnerability reporting', required: false, category: 'advanced' },
      { id: 'performance', name: 'Performance', description: 'Performance benchmarks and optimization', required: false, category: 'advanced' },
      { id: 'troubleshooting', name: 'Troubleshooting', description: 'Common issues and solutions', required: false, category: 'optional' },
      { id: 'feedback', name: 'Feedback', description: 'How to provide feedback', required: false, category: 'optional' },
      { id: 'lessons', name: 'Lessons Learned', description: 'Key insights from development', required: false, category: 'optional' },
      { id: 'optimizations', name: 'Optimizations', description: 'Performance and code optimizations', required: false, category: 'advanced' }, // done
      { id: 'tech', name: 'Tech Stack', description: 'Technologies and tools used', required: false, category: 'basic' },  // done
      { id: 'architecture', name: 'Architecture', description: 'System architecture and design', required: false, category: 'advanced' } //done
    ];
  }

  generateSection(sections: string[], analysis: RepoAnalysis, emoji: boolean) {
    let prompts: string[] = [];

    sections.forEach((section) => {
      const availableSection = AIServices.getAvailableSections().find((s) => s.id === section);
      if (!availableSection) throw new Error(`Section ${section} not found.`);

      const emote = emoji ? this.getEmoji(section) : "";
      let content = "";

      switch (section) {
        case "title":
          content = this.generateTitle(analysis);
          break;
        case "badges":
          content = this.generateBadges(analysis);
          break;
        case "installation":
          content = this.generateInstallation(analysis);
          break;
        case "usage":
          content = this.generateUsage(analysis);
          break;
        case "features":
          content = this.generateFeatures(analysis);
          break;
        case "api-reference":
          content = this.generateApiReferences(analysis); // agak ngaco
          break;
        case "license":
          content = this.generateLicense(analysis);
          break;
        case "environment":
          content = this.generateEnvVariables(analysis);
          break;
        case "tech":
          content = this.generateTechStack(analysis);
          break;
        case "architecture":
          content = this.generateArchitecture(analysis);
          break;
        case "optimizations":
          content = this.generateOptimizations(analysis);
          break;
        case "faq":
          content = this.generateFAQ(analysis);
          break;
        case "deployment":
          content = this.generateDeployment(analysis);
          break;
        case "testing":
          content = this.generateTesting(analysis);
          break;
        default:
          content = `No generator for section: ${section}`;
      }

      if (content) {
        prompts.push(`### ${emote}${availableSection.name}\n${content}`);
      }
    });

    return prompts.join("\n\n");
  }

  private getEmoji(section: string): string {
    const emojiMap: Record<string, string> = {
      'title': '🚀 ',
      'badges': '📊 ',
      'installation': '🔧 ',
      'usage': '💻 ',
      'features': '✨ ',
      'api-reference': '📚 ',
      'environment-variables': '🔐 ',
      'deployment': '🚀 ',
      'documentation': '📖 ',
      'testing': '🧪 ',
      'roadmap': '🗺️ ',
      'contributing': '🤝 ',
      'license': '📄 ',
      'authors': '👥 ',
      'acknowledgments': '🙏 ',
      'support': '💬 ',
      'faq': '❓ ',
      'changelog': '📝 ',
      'related': '🔗 ',
      'feedback': '💭 ',
      'lessons': '🎓 ',
      'optimizations': '🎯 ',
      'tech-stack': '🛠️ ',
      'architecture': '🏗️ ',
    };

    return emojiMap[section] || '📌';
  }

  private generateTitle(analysis: RepoAnalysis) {
    const prompt = `
      You are an assistant that generates concise and clear project titles and project description for a README.md file.

      INPUT:
      1. Source code of the project.
      2. Programming language of the source code: ${analysis.language}.
      3. Optional short project description: ${analysis.description}.

      TASK:
      - Analyze the source code and programming language.
      - Infer the main purpose of the project.
      - Generate a short and catchy project title that:
        - Clearly indicates what the project does.
        - Includes or hints at the programming language.
        - Avoids generic phrases like "My App" or "Code Project".
      - Output only the title in plain text, no extra explanation.

      FORMAT:
      <Project Title>
    `
    return prompt;
  }

  private generateBadges(analysis: RepoAnalysis) {
    return `
    You are an assistant that generates GitHub-style shields.io badges for a README.md.

    INPUT:
    - Programming language: ${analysis.language}
    - License: ${analysis.license || "Unknown"}
    - Repo name: ${analysis.name}
    - Has CI: ${analysis.hasCI}
    - Has tests: ${analysis.hasTests}

    TASK:
    1. Generate shields.io badge URLs using relevant data.
    2. Always include language, license, stars, forks.
    3. If has CI, add build status badge.
    4. If has tests, add code coverage badge.
    5. Output as Markdown image links on one line, separated by spaces.
    6. Do not include extra explanation, only the badges in Markdown.

    OUTPUT:
    <badges>
  `;

  }

  private generateInstallation(analysis: RepoAnalysis) {
    return `
      You are an assistant that writes the "Installation" section of a README.md.

      INPUT:
      - Programming language: ${analysis.language}
      - Framework / libraries detected: ${analysis.dependencies}
      - Package manager: ${analysis.packageManager || "Unknown"}
      - Other setup requirements

      TASK:
      1. Provide step-by-step installation instructions in Markdown.
      2. Include dependency installation commands based on the detected package manager.
      3. Add environment setup if relevant.
      4. Use concise language and code blocks for commands.
      5. Do not include explanation outside the instructions.

      OUTPUT FORMAT:
      ## Installation
      \`\`\`bash
      # steps here
      \`\`\`
    `;
  }

  private generateUsage(analysis: RepoAnalysis) {
    const language = analysis.language;
    const apiEndpoints = analysis.apiEndpoints;
    const prompt = `
      You are an assistant that writes the "Usage" section for a README.md file.

      INPUT:
      1. Source code of the project.
      2. Programming language: ${language}.
      3. Optional: CLI commands, ${apiEndpoints}, or main functions.

      TASK:
      - Explain briefly how to run or use the project.
      - Use concise step-by-step format with code blocks where needed.
      - Include only essential commands or examples.
      - Keep the section under 8 lines.

      OUTPUT FORMAT:
      ## Usage
      <steps and commands in markdown>
    `

    return prompt;
  }

  private generateFeatures(analysis: RepoAnalysis) {
    const prompt = `
      You are an assistant that writes the "Features" section for a README.md file.

      INPUT:
      1. Source code of the project.
      2. Programming language: ${analysis.language}.
      3. Optional: ${analysis.description}, ${analysis.apiEndpoints}

      TASK:
      - Analyze the project to identify its main features.
      - List all features in plain language.
      - Use markdown bullet points.
      - Avoid overly generic phrases like "easy to use" unless code shows it.
      
      OUTPUT FORMAT:
      ## Features
      <steps and commands in markdown>
    `
    return prompt;
  }

  private generateLicense(analysis: RepoAnalysis) {
    return `
      You are an assistant that writes the "License" section of a README.md.

      INPUT:
      - License type: ${analysis.license || "Unknown"}
      - Project name: ${analysis.name}

      TASK:
      1. Clearly state the license type and year.
      2. Include copyright notice with the project name or author if available.
      3. Provide a short note linking to the full license text (e.g., LICENSE file).
      4. Output in Markdown with correct heading.

      OUTPUT FORMAT:
      ## License
      <license text here>
    `;
  }


  private generateApiReferences(analysis: RepoAnalysis) {
    return `
      You are an assistant that writes the "API Reference" section of a README.md.

      INPUT:
      - Programming language: ${analysis.language}
      - Framework / libraries: ${analysis.dependencies}
      - API endpoints detected: ${analysis.apiEndpoints?.join(", ") || "None"}
      - Authentication type

      TASK:
      1. List all API endpoints found in the project.
      2. For each endpoint, include:
        - HTTP method
        - Path
        - Short description of what it does
        - Example request & response in Markdown code blocks
      3. Group endpoints by feature/module if applicable.
      4. Keep descriptions concise but clear.

      OUTPUT FORMAT:
      ## API Reference
      ### <Endpoint Group>
      #### \`<METHOD>\` <path>
      Description...
      \`\`\`bash
      # Example request
      curl -X <METHOD> <URL>
      \`\`\`
      \`\`\`json
      # Example response
      {
        "key": "value"
      }
      \`\`\`
    `;
  }

  private generateEnvVariables(analysis: RepoAnalysis) {
    return `
    You are an assistant that writes the "Environment Variables" section of a README.md.

    INPUT:
    - Detected environment variables: ${analysis.environment?.join(", ") || "None"}
    - Project description: ${analysis.description || "No description"}

    TASK:
    1. List all environment variables required by the project.
    2. For each variable, explain briefly what it is for and if it's required or optional.
    3. Use a Markdown table with columns: Name, Description, Default/Example.
    4. If no variables are detected, output a note saying no env variables are required.
    5. Do not add extra commentary outside the section.

    OUTPUT FORMAT:
    ## Environment Variables
    <environment variables here>
  `;
  }

  private generateTechStack(analysis: RepoAnalysis) {
    return `
      You are an assistant that writes the "Tech Stack" section of a README.md.

      INPUT:
      - Programming language: ${analysis.language}
      - Frameworks / libraries detected: ${analysis.dependencies?.join(", ") || "None"}
      - Databases: ${analysis.dependencies?.join(", ") || analysis.dependencies.join(", ") || "None"}
      - Tools / DevOps: ${analysis.hasCI || analysis.hasDockerfile || "None"}
      - Project description: ${analysis.description || "No description"}

      TASK:
      1. List the main technologies, frameworks, libraries, and tools used in the project.
      2. Group them into categories (e.g., Languages, Frameworks, Database, Tools).
      3. Use Markdown bullet points.
      4. Keep names exact as detected.
      5. If no data is detected for a category, omit that category.

      OUTPUT FORMAT:
      ## Tech Stack
      **Languages**
      - JavaScript
      - TypeScript

      **Frameworks & Libraries**
      - Next.js
      - Express

      **Database**
      - PostgreSQL

      **Tools**
      - Docker
      - GitHub Actions
    `;
  }

  private generateArchitecture(analysis: RepoAnalysis) {
    return `
    You are an assistant that writes the "Architecture" section of a README.md.

    INPUT:
    - Programming language: ${analysis.language}
    - Frameworks/Libraries: ${analysis.dependencies.join(", ") || analysis.devDependencies.join(", ") || "None"}
    - Detected project structure: ${analysis.structure || "Not detected"}
    - API endpoints: ${analysis.apiEndpoints?.join(", ") || "None"}
    - Project description: ${analysis.description || "No description"}

    TASK:
    1. Describe the overall architecture of the project (monolith, microservices, layered architecture, MVC, etc.).
    2. Explain the main components and their roles.
    3. Optionally include a simple Markdown diagram if structure is clear (e.g., mermaid diagram).
    4. Keep it concise and easy to understand for developers.

    OUTPUT FORMAT:
    ## Architecture
    The project follows a **Layered Architecture**:

    - **Presentation Layer**: Handles user interface and request routing.
    - **Business Logic Layer**: Contains core application logic.
    - **Data Access Layer**: Manages database interactions.

    \`\`\`mermaid
    graph TD
      A[Client] --> B[API Gateway]
      B --> C[Service Layer]
      C --> D[Database]
    \`\`\`
  `;
  }

  private generateOptimizations(analysis: RepoAnalysis) {
    return `
      You are an assistant that writes the "Optimizations" section of a README.md.

      INPUT:
      - Programming language: ${analysis.language}
      - Frameworks/Libraries: ${analysis.dependencies?.join(", ") || analysis.devDependencies.join(", ") || "None"}
      - Code analysis (performance hints, caching, DB queries, etc.):
      - Project description: ${analysis.description || "No description"}

      TASK:
      1. List the main optimizations applied in this project (e.g., caching, lazy loading, efficient DB queries, code splitting, etc.).
      2. If no explicit optimizations are found, suggest common potential optimizations relevant to the detected stack.
      3. Use Markdown bullet points.
      4. Keep it concise and developer-friendly.

      OUTPUT FORMAT:
      ## Optimizations
      - Implemented server-side caching for API responses.
      - Reduced database queries with batch fetching.
      - Minified frontend assets for faster load times.
      - Enabled Docker layer caching to speed up builds.
        `;
  }

  private generateFAQ(analysis: RepoAnalysis) {
    return `
      You are an assistant that writes the "FAQ" section for a README.md.

      INPUT:
      - Project description: ${analysis.description}

      TASK:
      1. Generate 2–3 common questions developers/users may ask.
      2. Provide concise answers.

      OUTPUT FORMAT:
      ## FAQ
      **Q:** ...  
      **A:** ...
    `;
  }

  private generateDeployment(analysis: RepoAnalysis) {
    return `
    You are an assistant that writes the "Deployment" section for a README.md file.

    INPUT:
    - Project language/framework: ${analysis.language}, ${analysis.dependencies?.join(", ") || analysis.devDependencies.join(", ") || "None"}
    - Deployment notes: ${analysis.hasDockerfile || "None"}

    TASK:
    1. Provide step-by-step deployment instructions (local, Docker, or cloud).
    2. Use markdown code blocks for commands.
    3. Keep it clear and concise.

    OUTPUT FORMAT:
    ## Deployment
    \`\`\`bash
    # Example (Heroku)
    git push heroku main
    heroku open
    \`\`\`
      `;
  }

  private generateTesting(analysis: RepoAnalysis) {
    return `
      You are an assistant that writes the "Running Tests" section for a README.md file.

      INPUT:
      - Testing framework: ${analysis.devDependencies.join(',') || "Unknown"}
      - Coverage tools: ${analysis.scripts || "None"}

      TASK:
      1. Provide clear steps on how to run tests.
      2. Use markdown code blocks.
      3. Mention coverage reporting if available.

      OUTPUT FORMAT:
      ## Running Tests
      \`\`\`bash
      # Run tests
      npm test

      # Run tests with coverage
      npm run test:coverage
      \`\`\`
    `;
  }


}