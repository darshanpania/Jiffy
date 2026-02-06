# Contributing to JIFFY

First off, thank you for considering contributing to JIFFY! 🎉

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Process](#development-process)
- [Style Guidelines](#style-guidelines)
- [Commit Messages](#commit-messages)
- [Pull Request Process](#pull-request-process)

## Code of Conduct

This project adheres to a Code of Conduct. By participating, you are expected to uphold this code.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/jiffy.git`
3. Add upstream remote: `git remote add upstream https://github.com/darshanpania/jiffy.git`
4. Create a branch: `git checkout -b feature/my-feature`

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check existing issues. When creating a bug report, include:

- Clear and descriptive title
- Steps to reproduce
- Expected behavior
- Actual behavior
- Screenshots (if applicable)
- Device information (Android version, device model)
- App version

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, include:

- Clear and descriptive title
- Detailed description of the proposed feature
- Explanation of why this enhancement would be useful
- Possible implementation approach

### Pull Requests

- Fill in the pull request template
- Follow the Kotlin style guide
- Include tests for new features
- Update documentation as needed
- End all files with a newline

## Development Process

### Setting Up Development Environment

1. Install Android Studio Hedgehog or newer
2. Install required SDKs (API 24-34)
3. Configure `local.properties` with API keys
4. Sync Gradle and build the project

### Running Tests

```bash
# Unit tests
./gradlew test

# Instrumented tests
./gradlew connectedAndroidTest

# Code coverage
./gradlew jacocoTestReport
```

### Code Review Process

All submissions require review. We use GitHub pull requests for this purpose.

## Style Guidelines

### Kotlin Style Guide

We follow the [official Kotlin coding conventions](https://kotlinlang.org/docs/coding-conventions.html).

**Key points:**
- Use 4 spaces for indentation
- Max line length: 120 characters
- Use meaningful variable names
- Add KDoc comments for public APIs

### Project Structure

```
data/
  ├── local/      # Room database
  ├── remote/     # API services
  └── repository/ # Repository implementations
  
domain/
  ├── model/      # Business models
  ├── repository/ # Repository interfaces
  └── usecase/    # Use cases
  
presentation/
  ├── ui/         # Composables
  ├── viewmodel/  # ViewModels
  └── navigation/ # Navigation
```

### Naming Conventions

- **Classes:** PascalCase (e.g., `UserRepository`)
- **Functions:** camelCase (e.g., `getUserProfile`)
- **Constants:** UPPER_SNAKE_CASE (e.g., `MAX_RETRY_COUNT`)
- **Resources:** snake_case (e.g., `ic_launcher_round`)

## Commit Messages

We follow [Conventional Commits](https://www.conventionalcommits.org/).

**Format:**
```
type(scope): subject

body (optional)

footer (optional)
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**
```
feat(auth): add Apple Sign-In support

fix(chat): resolve message duplication issue

docs(readme): update setup instructions
```

## Pull Request Process

1. **Update Documentation**: Ensure README and relevant docs are updated
2. **Add Tests**: Include unit and/or UI tests for new features
3. **Update Changelog**: Add entry to CHANGELOG.md
4. **Follow Template**: Fill out the PR template completely
5. **Request Review**: Tag relevant reviewers
6. **Address Feedback**: Respond to all review comments
7. **Squash Commits**: Before merging, squash into logical commits

### Pull Request Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests pass
- [ ] UI tests pass
- [ ] Manual testing completed

## Screenshots (if applicable)

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] No new warnings
```

## Thank You!

Your contributions make JIFFY better for everyone. We appreciate your time and effort! 🙏
