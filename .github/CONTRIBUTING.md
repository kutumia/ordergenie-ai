# .github/CONTRIBUTING.md
# Contributing to OrderGenie AI

Thank you for your interest in contributing to OrderGenie AI! This document provides guidelines and information for contributors.

## 🎯 Project Overview

OrderGenie AI is an AI-powered restaurant ordering system built with:
- **Phase 1**: Core MVP (Restaurant management, orders, payments)
- **Phase 2**: SaaS Platform (Multi-tenant, dynamic sites)
- **Phase 3**: AI Integration (WhatsApp ordering, voice processing)

## 🚀 Getting Started

### Development Setup
1. Fork the repository
2. Clone your fork: `git clone https://github.com/yourusername/ordergenie-ai.git`
3. Install dependencies: `npm install`
4. Copy environment variables: `cp .env.example .env.local`
5. Start development environment: `npm run setup`

### Development Workflow
1. Create a feature branch: `git checkout -b feature/your-feature-name`
2. Make your changes
3. Write/update tests
4. Run tests: `npm run test`
5. Run linting: `npm run lint`
6. Commit changes: `git commit -m "feat: your descriptive message"`
7. Push to your fork: `git push origin feature/your-feature-name`
8. Create a Pull Request

## 📋 Code Guidelines

### Commit Messages
We follow [Conventional Commits](https://www.conventionalcommits.org/):
- `feat:` - New features
- `fix:` - Bug fixes
- `docs:` - Documentation changes
- `style:` - Code style changes
- `refactor:` - Code refactoring
- `test:` - Test additions/changes
- `chore:` - Maintenance tasks

### Code Style
- Use TypeScript for all new code
- Follow ESLint and Prettier configurations
- Use meaningful variable and function names
- Add JSDoc comments for complex functions
- Follow React best practices

### File Organization
- Components in `/src/components/`
- Business logic in `/src/services/`
- Types in `/src/types/`
- Utilities in `/src/lib/utils/`

## 🧪 Testing

### Writing Tests
- Unit tests for all services and utilities
- Component tests for UI components
- E2E tests for critical user flows
- Maintain minimum 70% code coverage

### Running Tests
```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Coverage report
npm run test:coverage
```

## 📚 Documentation

- Update relevant documentation for new features
- Add JSDoc comments to public APIs
- Update README.md if needed
- Add examples for complex features

## 🐛 Bug Reports

When reporting bugs, include:
- Clear description of the issue
- Steps to reproduce
- Expected vs actual behavior
- Environment details
- Screenshots if applicable

## ✨ Feature Requests

For new features, provide:
- Clear problem statement
- Proposed solution
- Business value
- Acceptance criteria
- Technical considerations

## 🔍 Code Review Process

1. All changes require review from maintainers
2. Ensure all tests pass
3. Follow code style guidelines
4. Update documentation as needed
5. Address reviewer feedback promptly

## 📞 Getting Help

- Check existing [documentation](./docs/)
- Search [existing issues](https://github.com/yourusername/ordergenie-ai/issues)
- Join our [Discord](https://discord.gg/ordergenie) (if applicable)
- Email: developers@ordergenie.ai

## 📄 License

By contributing, you agree that your contributions will be licensed under the same license as the project.

Thank you for contributing to OrderGenie AI! 🚀