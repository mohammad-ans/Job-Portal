import re
from typing import List, Set

SKILLS_VOCAB: List[str] = [
    # Languages
    "Python", "JavaScript", "TypeScript", "Java", "C", "C++", "C#", "Go", "Rust",
    "Ruby", "PHP", "Swift", "Kotlin", "R", "Scala", "Dart", "MATLAB", "SQL",
    "HTML", "CSS", "SASS", "LESS", "HTML5", "CSS3", "Bash", "Shell", "Perl",
    "Haskell", "Elixir", "Clojure", "Assembly",
    # Frontend
    "React", "Angular", "Vue.js", "Svelte", "Next.js", "Nuxt.js", "Gatsby",
    "Redux", "Tailwind CSS", "Bootstrap", "jQuery", "Webpack", "Vite",
    "Material UI", "Figma", "UX/UI",
    # Backend / Frameworks
    "Django", "Flask", "FastAPI", "Spring Boot", "Node.js", "Express.js",
    "Laravel", "Rails", "ASP.NET", ".NET", "NestJS", "GraphQL", "REST APIs",
    "gRPC", "WebSockets", "OAuth", "JWT",
    # Data / ML
    "Pandas", "NumPy", "Scikit-learn", "TensorFlow", "PyTorch", "Keras",
    "OpenCV", "NLTK", "SpaCy", "Hugging Face", "Machine Learning",
    "Deep Learning", "NLP", "Data Analysis", "Data Science", "Computer Vision",
    "Statistics", "Linear Algebra", "Tableau", "Power BI", "Data Visualization",
    "Big Data", "Spark", "Hadoop", "Kafka", "Airflow", "Matplotlib", "Seaborn",
    # Databases
    "PostgreSQL", "MySQL", "MongoDB", "Redis", "SQLite", "Oracle", "Cassandra",
    "DynamoDB", "Elasticsearch", "Firebase", "MariaDB", "Neo4j",
    # Cloud / DevOps
    "AWS", "Azure", "GCP", "Docker", "Kubernetes", "Terraform", "Ansible",
    "CI/CD", "Jenkins", "GitHub Actions", "GitLab CI", "Nginx", "Apache",
    "Linux", "Unix", "Microservices", "Serverless",
    # Tools / Practices
    "Git", "GitHub", "GitLab", "Bitbucket", "JIRA", "Confluence",
    "Agile", "Scrum", "Kanban", "DevOps", "TDD", "Unit Testing",
    "Integration Testing", "Problem Solving", "Debugging", "Testing",
    # Other
    "Photoshop", "Illustrator", "Excel", "Communication", "Leadership",
    "Teamwork", "Prototyping", "Wireframing", "User Research",
]

_PATTERNS: List[tuple] = [
    (re.compile(r'\b' + re.escape(skill) + r'\b', re.IGNORECASE), skill)
    for skill in SKILLS_VOCAB
]


def extract_skills(text: str) -> List[str]:
    found: Set[str] = set()
    for pattern, canonical in _PATTERNS:
        if pattern.search(text):
            found.add(canonical)
    return sorted(found)
