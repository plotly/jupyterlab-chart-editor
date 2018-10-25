## Development

```bash
# Clone the repo to your local environment
git clone https://github.com/plotly/jupyterlab-chart-editor.git
cd jupyterlab-chart-editor
# Install dependencies
yarn
# Build Typescript source
yarn build
# Link your development version of the extension with JupyterLab
jupyter labextension link .
# Rebuild Typescript source after making changes
yarn build
# Rebuild JupyterLab after making any changes
jupyter lab build
```

You can watch the jupyter-renderers directory and run JupyterLab in watch mode to watch for changes in the extension's source and automatically rebuild the extension and application.

```bash
# Run jupyterlab in watch mode in one terminal tab
jupyter lab --watch
# Watch the jupyter-renderers directory
yarn watch
```