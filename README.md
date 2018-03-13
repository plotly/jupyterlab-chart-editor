# jupyterlab-chart-editor

[![Binder](https://beta.mybinder.org/badge.svg)](https://mybinder.org/v2/gh/plotly/jupyterlab-chart-editor/master?urlpath=lab/tree/notebooks)

A JupyterLab extension for creating and editing Plotly charts

![](https://user-images.githubusercontent.com/512354/37057677-0055595e-213d-11e8-9f16-b456a9c61388.gif)

## Prerequisites

* JupyterLab >= 0.31.0
* plotly.py >= 2.0.0

## Install

```bash
jupyter labextension install jupyterlab-chart-editor
```

## Usage

To create a chart from a dict:

```python
from IPython.display import display

def PlotlyEditor(data=[]):
    bundle = {}
    bundle['application/vnd.plotly-editor.v1+json'] = data
    display(bundle, raw=True)

data = {
    'col1': [1, 2, 3],
    'col2': [4, 3, 2],
    'col3': [17, 13, 9],
}

PlotlyEditor(data)
```

To create a chart from a pandas DataFrame:

```python
import pandas as pd
from IPython.display import display

def PlotlyEditor(data=[]):
    bundle = {}
    if isinstance(data, pd.DataFrame):
        bundle['application/vnd.plotly-editor.v1+json'] = data.to_dict(orient="list")
    else:
        bundle['application/vnd.plotly-editor.v1+json'] = data
    display(bundle, raw=True)

cars = pd.read_json('https://raw.githubusercontent.com/vega/vega/master/docs/data/cars.json')

PlotlyEditor(cars)
```

To render a `.plotly` or `.plotly.json` file, simply open it:

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

## Uninstall

```bash
jupyter labextension uninstall jupyterlab-chart-editor
```
