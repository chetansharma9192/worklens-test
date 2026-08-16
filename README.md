# WorkLens

AI-assisted developer guidance tool built with a VS Code extension frontend and Django backend.

## Project Roadmap / Modules
- [x] **Module 1:** Selection capture & Right-click context menu
- [x] **Module 2:** Local HTTP bridge between Extension & Django backend
- [ ] **Module 3:** ChromaDB vector database integration & embeddings
- [ ] **Module 4:** LLM Socratic guidance engine & cache-hit retrieval

## Quick Setup for Collaborators

### Backend Setup
1. `cd worklens-backend`
2. `python -m pip install -r requirements.txt`
3. `python manage.py migrate`
4. `python manage.py runserver`

### Extension Setup
1. `cd worklens-extension`
2. `npm install`
3. Press `F5` in VS Code to launch the test host.
