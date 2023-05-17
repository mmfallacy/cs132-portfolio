<script>
  import { onMount } from 'svelte'
  import * as d3 from 'd3'
  import Plot from 'svelte-plotly.js'

  let data
  let data1
  onMount(() => {
    d3.csv('Complete_Data.csv').then(csvData => {
      data = csvData
      data = data.filter(function (d) {
        return d.Tweet !== '' && d['Tweet URL'] !== ''
      })

      data.forEach(function (d) {
        delete d.Location
        delete d['Account bio']
        delete d.Group
        delete d.Collector
        delete d.Category
        delete d.Keywords
        delete d.Rating
        delete d.Reasoning
        delete d.Remarks
        delete d.Reviewer
        delete d.Review
        delete d.Screenshot
        delete d.Views
      })

      data.forEach(function (d, i) {
        Object.keys(d).forEach(function (key) {
          if (d[key] === '') {
            data[i][key] = 0
          }
        })
      })

      // Split the data into separate traces for each Account type
      data1 = [
        {
          x: data
            .filter(function (d) {
              return d['Account type'].trim() === 'Identified'
            })
            .map(function (d) {
              return parseInt(d.Following)
            }),
          y: data
            .filter(function (d) {
              return d['Account type'].trim() === 'Identified'
            })
            .map(function (d) {
              return parseInt(d.Followers)
            }),
          text: data
            .filter(function (d) {
              return d['Account type'].trim() === 'Identified'
            })
            .map(function (d) {
              return d['Account handle']
            }),
          mode: 'markers',
          type: 'scatter',
          name: 'Identified',
          marker: {
            size: 8,
            color: 'blue',
            opacity: 0.8,
            line: {
              color: 'black',
              width: 1
            }
          }
        },
        {
          x: data
            .filter(function (d) {
              return d['Account type'].trim() === 'Media'
            })
            .map(function (d) {
              return parseInt(d.Following)
            }),
          y: data
            .filter(function (d) {
              return d['Account type'].trim() === 'Media'
            })
            .map(function (d) {
              return parseInt(d.Followers)
            }),
          text: data
            .filter(function (d) {
              return d['Account type'].trim() === 'Media'
            })
            .map(function (d) {
              return d['Account handle']
            }),
          mode: 'markers',
          type: 'scatter',
          name: 'Media',
          marker: {
            size: 8,
            color: 'orange',
            opacity: 0.8,
            line: {
              color: 'black',
              width: 1
            }
          }
        },
        {
          x: data
            .filter(function (d) {
              return d['Account type'].trim() === 'Anonymous'
            })
            .map(function (d) {
              return parseInt(d.Following)
            }),
          y: data
            .filter(function (d) {
              return d['Account type'].trim() === 'Anonymous'
            })
            .map(function (d) {
              return parseInt(d.Followers)
            }),
          text: data
            .filter(function (d) {
              return d['Account type'].trim() === 'Anonymous'
            })
            .map(function (d) {
              return d['Account handle']
            }),
          mode: 'markers',
          type: 'scatter',
          name: 'Anonymous',
          marker: {
            size: 8,
            color: 'red',
            opacity: 0.8,
            line: {
              color: 'black',
              width: 1
            }
          }
        }
      ]
      console.log(data1)
    })
  })
</script>

<Plot
  data={data1}
  layout={{
    title: 'Scatter Plot of Followers vs Following',
    xaxis: { title: 'Following', titlefont: { size: 14, color: '#7f7f7f' }, zeroline: false },
    yaxis: { title: 'Followers', titlefont: { size: 14, color: '#7f7f7f' }, zeroline: false },
    hovermode: 'closest',
    margin: { t: 50 },
    height: 500,
    showlegend: true,
    legend: {
      x: 1,
      xanchor: 'right',
      y: 1,
      yanchor: 'top',
      orientation: 'v'
    }
  }}
  fillParent="width"
  debounce={250} />
