# jupyterlab-chart-editor

[![Binder](https://beta.mybinder.org/badge.svg)](https://mybinder.org/v2/gh/plotly/jupyterlab-chart-editor/master?urlpath=lab/tree/notebooks)

A JupyterLab extension for creating and editing Plotly charts, based on https://github.com/plotly/react-chart-editor

![](notebooks/ChartEditorExample.gif)

## Prerequisites

* JupyterLab >= 0.34
* plotly.py >= 3.3.0

## Install

```bash
jupyter labextension install jupyterlab-chart-editor
```

## Usage

Create and display a figure

```python
import plotly.graph_objs as go
import plotly.io as pio

fig = go.FigureWidget()
fig.add_scatter(y=[2, 4, 3, 2.5])
fig
```
![](notebooks/scatter.png)

Write figure to JSON

```python
pio.write_json(fig, 'scatter.plotly')
```

Right-click `scatter.plotly` from the file menu and open with "Plotly Editor". Make some changes to the figure, then use the file menu to save as `scatter-styled.plotly`.

Then import `scatter-styled.plotly` back into plotly.py

```python
fig_styled = pio.read_json('scatter-styled.plotly', output_type='FigureWidget')
fig_styled
```
![](notebooks/scatter-styled.png)

## Uninstall

```bash
jupyter labextension uninstall jupyterlab-chart-editor
```
