# Version Control Commit Message Guidelines

- When making changes, always create a new branch with a descriptive name that reflects the purpose of the changes. For example, if you are fixing a bug in the user authentication module, you might name your branch `fix/user-authentication-bug`.
- Always use conventional commit message formats. Examples of this for the project can be:
  - `feat: add new user authentication module`
  - `feat(books): implement new book management feature`
  - `fix: resolve issue with data serialization`
  - `fix(books): correct bug in inventory update`
  - `docs: update API documentation for clarity`
  - `style: reformat code to adhere to style guidelines`
  - `refactor: optimize database query performance`
  - `test: add unit tests for user service`
  - `chore: update dependencies to latest versions`
- Commit messages should be very concise steps, providing a clear but short summary and readable description of the changes made
- To avoid unwanted mess in version control, even when directly asked to push, ALWAYS ask the user to manually type the commands out. You can provide the commands, but don't execute them.