Chart.defaults.global.hover.mode = 'nearest'
Chart.defaults.global.elements.line.tension = 0
Chart.defaults.global.elements.line.fill = false
Chart.defaults.global.tooltips.enabled = false
Chart.defaults.global.elements.point.radius = 0

let livePollInterval;
let statsSelect = $('#statsSelect');

let canvas = [{
	canvas: document.getElementById('handshakeChart'),
	value: 'handshake',
	object: {}
}, {
	canvas: document.getElementById('receivedChart'),
	value: 'received',
	object: {}
}, {
	canvas: document.getElementById('sentChart'),
	value: 'sent',
	object: {}
}]

let charts = []

function triggerInterval() {
	livePollInterval = setInterval(function () {
		adddata()
	}, 1000)
}

function adddata () {
	$.getJSON('/api/stats/live', function (data) {
		let chartData = prepareChartData(data);
		updateChart(chartData)
	})
}

function createChart(dataSets) {
	$.each(canvas, function (index, value) {
		canvas[index].object =  Chart.Line(document.getElementById(value.value + 'Chart'), {
			data: {
				labels: dataSets['labels'],
				datasets: dataSets[value.value]
			},
			options: {
				showLines: true,
				animation: {
					duration: 0
				},
				plugins: {
					colorschemes: {
						scheme: 'tableau.Tableau20'
					}
				}
			}
		})
	})

	$('#loading').removeClass('active');
}

function updateChart (dataSets) {
	let items = canvas[0].object.data.labels.length;
	canvas[0].object.data.labels[items] = dataSets['labels'][0]

	if(items > 59) {
		canvas[0].object.data.labels.splice(0, 1);
	}

	$.each(canvas, function (index, value) {
		$.each(canvas[index].object.data.datasets, function (indexDataSet, dataset) {
			$.each(dataSets[canvas[index].value], function (indexSet, set) {
				canvas[index].object.data.datasets[indexSet].data.push(dataSets[canvas[index].value][indexSet].data[0])

				if(items > 59) {
					canvas[index].object.data.datasets[indexSet].data.splice(0, 1);
				}
			})
		})

		canvas[index].object.update();
	})
}

function prepareChartData(data) {
	let labels = []
	let dataSent = []
	let dataReceived = []
	let dataHandshake = []
	let dataSets = []

	$.each(data, function (time, tValue) {
		labels.push(new Date(parseInt(time)).toLocaleTimeString())

		$.each(tValue, function (client, cValue) {
			dataSent[client] = dataSent[client] || []
			dataSent[client].push(cValue.sent)
			dataReceived[client] = dataReceived[client] || []
			dataReceived[client].push(cValue.received)
			dataHandshake[client] = dataHandshake[client] || []
			dataHandshake[client].push(cValue.handshake)
		})
	});

	let charts = {
		sent: dataSent,
		received: dataReceived,
		handshake: dataHandshake,
	}

	$.each(charts, function (index, client) {
		let sets = []
		$.each(Object.keys(client), function (key, value) {
			sets[key] = {
				label: value,
				fill: true,
				lineTension: 0.1,
				borderCapStyle: 'butt',
				borderDash: [],
				borderDashOffset: 0.0,
				borderJoinStyle: 'miter',
				data: client[value],
			}
		})

		dataSets[index] = sets;
	})

	dataSets['labels'] = labels;

	return dataSets;
}

function clearChart() {
	$.each(canvas, function (index, value) {
		canvas[index].object.data.labels = []
		$.each(canvas[index].object.data.datasets, function (indexDataSet, dataset) {
			canvas[index].object.data.datasets[indexDataSet].data = [];
		})

		canvas[index].object.update();
	})
}

$(document).ready(function () {
	statsSelect.on('change', function (option) {
		clearChart();
		$('#loading').addClass('active');

		if(statsSelect.val() === 'live') {
			triggerInterval();
			$('#loading').removeClass('active');
		} else {
			$.getJSON('/api/stats/' + statsSelect.val(), function (data) {
				let chartData = prepareChartData(data);
				createChart(chartData);
			})

			clearInterval(livePollInterval);
		}

	})

	if ($('#stats-tab').length) {
		$.getJSON('/api/stats/live', function (data) {
			let chartData = prepareChartData(data);
			createChart(chartData);
		})
	}

	if ($('#stats-tab').length) {
		triggerInterval();
	}
})
