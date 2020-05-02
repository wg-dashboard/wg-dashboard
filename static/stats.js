Chart.defaults.global.hover.mode = 'nearest';
// Chart.defaults.global.elements.line.borderColor = '#ff0000';
Chart.defaults.global.elements.line.tension = 0;
Chart.defaults.global.elements.line.fill = false;
// Chart.defaults.global.elements.point.borderColor = '#ff0000';
Chart.defaults.global.tooltips.enabled = false;
Chart.defaults.global.elements.point.radius = 0;

$(document).ready(function(){
	var canvas = document.getElementById('myChart');
	var data = {
		labels: [],
		datasets: [
			{
				label: "My First dataset",
				fill: false,
				lineTension: 0.1,
				backgroundColor: "rgba(75,192,192,0.4)",
				borderColor: "rgba(75,192,192,1)",
				borderCapStyle: 'butt',
				borderDash: [],
				borderDashOffset: 0.0,
				borderJoinStyle: 'miter',
				pointBorderColor: "rgba(75,192,192,1)",
				pointBackgroundColor: "#fff",
				pointBorderWidth: 1,
				pointHoverRadius: 5,
				pointHoverBackgroundColor: "rgba(75,192,192,1)",
				pointHoverBorderColor: "rgba(220,220,220,1)",
				pointHoverBorderWidth: 2,
				pointRadius: 5,
				pointHitRadius: 10,
				data: [],
			}
		]
	};

	function adddata() {
		let items = myLineChart.data.datasets[0].data.length
		myLineChart.data.labels[items] = new Date().getSeconds();
		myLineChart.data.datasets[0].data[items] = Math.floor(Math.random() * Math.floor(1000));

		if(items > 10) {
			myLineChart.data.labels.splice(0,1)
			myLineChart.data.datasets[0].data.splice(0,1)
		}

		myLineChart.update();
	}
	var option = {
		showLines: true
	};
	var myLineChart = Chart.Line(canvas,{
		data:data,
		options:option
	});

	setInterval(function () {
		adddata();
	}, 1000)
});
