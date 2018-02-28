# jupyterlab-chart-editor

A JupyterLab extension for creating and editing Plotly charts


## Prerequisites

* JupyterLab

## Installation

```bash
jupyter labextension install jupyterlab-chart-editor
```

## Development

For a development install (requires npm version 4 or later), do the following in the repository directory:

```bash
npm install
npm run build
jupyter labextension link .
```

To rebuild the package and the JupyterLab app:

```bash
npm run build
jupyter lab build
```

