$(document).ready(() => {
	// edit peer
	$("#peers").on("click", "button", (e) => {
		if ($(e.currentTarget).hasClass("editBtn")) {
			const tableRow = $(e.currentTarget).parent().parent();

			$(e.currentTarget)
				.html(`<i class="far fa-save fa-lg"></i>`)
				.removeClass("editBtn")
				.addClass("saveBtn");

			tableRow
				.find(".activeBtn")
				.attr("disabled", false);

			tableRow
				.find("input")
				.css("color", "#4285F4")
				.attr("disabled", false);

			tableRow
				.find("input[name='public_key']")
				.css("color", "#495057")
				.attr("disabled", true);
		} else if ($(e.currentTarget).hasClass("saveBtn")) {
			const tableRow = $(e.currentTarget).parent().parent();
			const data = {};

			tableRow.find("input").each(function () {
				data[this.name] = this.value;
			});

			const active = tableRow.find(".activeBtn");
			if (active.hasClass("btn-danger")) {
				data["active"] = false;
			} else {
				data["active"] = true;
			}

			const req = $.ajax({
				url: `/api/peer/${tableRow[0].id}`,
				method: "PUT",
				data: JSON.stringify(data),
				contentType: "application/json; charset=utf-8",
				dataType: "json"
			});

			req.then(function( data ) {
				$(e.currentTarget)
					.html(`<i class="far fa-edit fa-lg"></i>`)
					.removeClass("saveBtn")
					.addClass("editBtn");

				tableRow
					.find("input")
					.css("color", "#495057")
					.attr("disabled", true);

				tableRow
					.find("button")
					.attr("disabled", false);

				tableRow
					.find(".activeBtn")
					.attr("disabled", true);
			});

			req.catch(function( data ) {
				const msg = data.responseJSON ? data.responseJSON.msg : "";
				alert("could not save user: " + msg);
			});
		} else if ($(e.currentTarget).hasClass("deleteBtn")) {
			const confirmation = confirm("Are you sure you want to delete this peer?");

			if (confirmation) {
				const tableRow = $(e.currentTarget).parent().parent().parent();

				const req = $.ajax({
					url: `/api/peer/${tableRow[0].id}`,
					method: "DELETE"
				})

				req.then(function( data ) {
					tableRow
						.remove();
				});

				req.catch(function( data ) {
					const msg = data.responseJSON ? data.responseJSON.msg : "";
					alert("could not delete user: " + msg);
				});
			}
		} else if ($(e.currentTarget).hasClass("activeBtn")) {
			if ($(e.currentTarget).hasClass("btn-danger")) {
				$(e.currentTarget).removeClass("btn-danger").addClass("btn-success").html(`<i class="fas fa-check fa-lg"></i>`);
			} else {
				$(e.currentTarget).removeClass("btn-success").addClass("btn-danger").html(`<i class="fas fa-times fa-lg"></i>`);
			}
		}
	});

	// edit server_settings
	$("#server_settings").on("click", (e) => {
		if ($(e.currentTarget).hasClass("editBtn")) {
			$(e.currentTarget)
				.removeClass("editBtn")
				.removeClass("fa-edit")
				.addClass("saveBtn")
				.addClass("fa-save");
			$("#ip_address").attr("disabled", false).css("color", "#4285F4");
			$("#virtual_ip_address").attr("disabled", false).css("color", "#4285F4");
			$("#port").attr("disabled", false).css("color", "#4285F4");
			$("#cidr").attr("disabled", false).css("color", "#4285F4");
			$("#dns").attr("disabled", false).css("color", "#4285F4");
			$("#network_adapter").attr("disabled", false).css("color", "#4285F4");
			$("#config_path").attr("disabled", false).css("color", "#4285F4");
		} else if ($(e.currentTarget).hasClass("saveBtn")) {
			const ip_address = $("#ip_address").val();
			const virtual_ip_address = $("#virtual_ip_address").val();
			const port = $("#port").val();
			const cidr = $("#cidr").val();
			const dns = $("#dns").val();
			const public_key = $("#public_key").val();
			const network_adapter = $("#network_adapter").val();
			const config_path = $("#config_path").val();

			const req = $.ajax({
				url: `/api/server_settings/save`,
				method: "PUT",
				data: JSON.stringify(
					{
						ip_address: ip_address,
						virtual_ip_address: virtual_ip_address,
						port: port,
						cidr: cidr,
						dns: dns,
						public_key: public_key,
						network_adapter: network_adapter,
						config_path: config_path,
					}
				),
				contentType: "application/json; charset=utf-8",
				dataType: "json"
			});

			req.then(function( data ) {
				$(e.currentTarget)
					.removeClass("fa-save")
					.removeClass("saveBtn")
					.addClass("fa-edit")
					.addClass("editBtn");
				$("#ip_address").attr("disabled", true).css("color", "#495057");
				$("#virtual_ip_address").attr("disabled", true).css("color", "#495057");
				$("#port").attr("disabled", true).css("color", "#495057");
				$("#dns").attr("disabled", true).css("color", "#495057");
				$("#cidr").attr("disabled", true).css("color", "#495057");
				$("#public_key").attr("disabled", true).css("color", "#495057");
				$("#network_adapter").attr("disabled", true).css("color", "#495057");
				$("#config_path").attr("disabled", true).css("color", "#495057");
			});

			req.catch(function( data ) {
				const msg = data.responseJSON ? data.responseJSON.msg : "";
				alert("could not save data: " + msg);
			});
		}
	});

	// edit allowed_ips
	$("#allowed_ip_settings").on("click", (e) => {
		if ($(e.currentTarget).hasClass("editBtn")) {
			$(e.currentTarget)
				.removeClass("editBtn")
				.removeClass("fa-edit")
				.addClass("saveBtn")
				.addClass("fa-save");
			$("#allowed_ips").attr("disabled", false).css("color", "#4285F4");
		} else if ($(e.currentTarget).hasClass("saveBtn")) {
			let allowed_ips = $("#allowed_ips").val();

			const req = $.ajax({
				url: `/api/server_settings/save/allowed_ips`,
				method: "PUT",
				data: JSON.stringify(
					{
						allowed_ips: allowed_ips,
					}
				),
				contentType: "application/json; charset=utf-8",
				dataType: "json"
			});

			req.then(function( data ) {
				$(e.currentTarget)
					.removeClass("fa-save")
					.removeClass("saveBtn")
					.addClass("fa-edit")
					.addClass("editBtn");
				$("#allowed_ips").attr("disabled", false).css("color", "#495057");

				$("input[name='allowed_ips'").each((i, e) => { $(e).val(allowed_ips) });
			});

			req.catch(function( data ) {
				const msg = data.responseJSON ? data.responseJSON.msg : "";
				alert("could not save allowed ips: " + msg);
			});
		}
	});

	// edit user
	$("#users").on("click", "button", (e) => {
		if ($(e.currentTarget).hasClass("editBtn")) {
			$(e.currentTarget)
				.html(`<i class="far fa-save fa-lg"></i>`)
				.removeClass("editBtn")
				.addClass("saveBtn");

			const tableRow = $(e.currentTarget).parent().parent();

			tableRow
				.find("input")
				.css("color", "#4285F4")
				.attr("disabled", false);
		} else if ($(e.currentTarget).hasClass("saveBtn")) {
			const tableRow = $(e.currentTarget).parent().parent();

			let username = tableRow.find("input[name='username']").val();
			let password = tableRow.find("input[name='password']").val();

			const id = tableRow[0].id.replace("user_", "");

			const req = $.ajax({
				url: `/api/user/edit/${id}`,
				method: "PUT",
				data: JSON.stringify(
					{
						username,
						password,
					}
				),
				contentType: "application/json; charset=utf-8",
				dataType: "json"
			});

			req.then(function( data ) {
				$(e.currentTarget)
					.html(`<i class="far fa-edit fa-lg"></i>`)
					.removeClass("saveBtn")
					.addClass("editBtn");

				tableRow
					.find("input")
					.css("color", "#495057")
					.attr("disabled", true);
			});

			req.catch(function( data ) {
				const msg = data.responseJSON ? data.responseJSON.msg : "";
				alert("could not save user: " + msg);
			});
		} else if ($(e.currentTarget).hasClass("deleteBtn")) {
			const confirmation = confirm("Are you sure you want to delete this user?");

			if (confirmation) {
				const tableRow = $(e.currentTarget).parent().parent();
				const id = tableRow[0].id.replace("user_", "");

				const req = $.ajax({
					url: `/api/user/delete/${id}`,
					method: "DELETE"
				})

				req.then(function( data ) {
					tableRow
						.remove();
				});

				req.catch(function( data ) {
					const msg = data.responseJSON ? data.responseJSON.msg : "";
					alert("could not delete user: " + msg);
				});
			}
		}
	});

	$("#server_settings_items").on("change", "input", (e) => {
		const target = $(e.currentTarget)

		if (target[0].id) {
			config[target[0].id] = target.val();
		} else if (target[0].name) {
			config[target[0].id] = target.val();
		}

		checkToast();
	});

	$("#allowed_ips").on("change", (e) => {
		const target = $(e.currentTarget)

		config["allowed_ips"] = target.val().split(",");

		checkToast();
	});

	$("#peers").on("change", "input", (e) => {
		const parent = $(e.currentTarget).parent().parent().parent();
		const index = parent[0].id;

		parent.find("input").each((i, e) => {
			console.log(e.name, $(e).val());
			config.peers[index][e.name] = $(e).val();
		});

		checkToast();
	});

});

// check if we need to show toast that settings need to be saved
let toastShown = false;
function checkToast() {
	if (JSON.stringify(config) !== JSON.stringify(_config)) {
		if (!toastShown) {
			$("#alert-container").append(`<div class="alert-box">Remember to click <button class="btn btn-danger saveAndRestartBtn btn-sm pulse infinite" onclick="saveAndRestart();">Regenerate Config and Restart Wireguard</button> after you changed your settings! This includes peer changes.</div>`);
			$(".saveAndRestartBtn").addClass("animated");
			toastShown = true;
		}
	} else {
		$("#alert-container").empty();
		$(".saveAndRestartBtn").removeClass("animated");
		toastShown = false;
	}
}

// create a new peer
function createNewPeer() {
	const req = $.ajax({
		url: "/api/peer",
		method: "POST",
		contentType: "application/json; charset=utf-8",
		dataType: "json"
	});

	req.then(function( data ) {
		$("#peers").append(`
		<tr class="text-center p-2" id="${data.id}">
			<td>
				<div class="my-auto" title="Show QR code for this peer">
					<button onclick="makeQR(${data.id});" class="btn btn-dark btn-sm" data-toggle="modal" name="getqrcode" data-target="#qrModal" disabled>
						<i class="fas fa-qrcode fa-lg"></i>
					</button>
				</div>
			</td>
			<td>
				<div class="my-auto" title="Download peer">
					<button onclick="window.location='/api/download/${data.id}';" class="btn btn-dark btn-sm" name="downloadfile" disabled>
						<i class="fa fa-download fa-lg"></i>
					</button>
				</div>
			</td>
			<td>
				<button class="btn btn-success btn-sm activeBtn w-100" title="Peer is active">
					<i class="fas fa-check fa-lg"></i>
				</button>
			</td>
			<td>
				<div class="md-form m-0" title="Device name">
					<input type="text" class="form-control" name="device" value=""></input>
				</div>
			</td>
			<td>
				<div class="md-form m-0" title="Public key">
					<input id="public_key" type="text" class="form-control" name="public_key" value="${data.public_key}" disabled></input>
				</div>
			</td>
			<td>
				<div class="md-form m-0" title="Virtual IP address">
					<input type="text" class="form-control" name="virtual_ip" value="${data.ip}"></input>
				</div>
			</td>
			<td>
				<button class="btn btn-dark btn-sm saveBtn w-100" title="Save peer">
					<i class="far fa-save fa-lg"></i>
				</button>
			</td>
			<td>
				<div class="my-auto" title="Delete peer">
					<button class="btn btn-danger btn-sm deleteBtn w-100">
						<i class="fas fa-trash fa-lg"></i>
					</button>
				</div>
			</td>
		</tr>
		`);
	});

	req.catch(function( data ) {
		const msg = data.responseJSON ? data.responseJSON.msg : "";
		alert("could not save user: " + msg);
	});
};

// login
function login() {
	const req = $.ajax({
		url: `/api/login`,
		method: "POST",
		data: JSON.stringify({
			username: $("#username").val(),
			password: $("#password").val(),
		}),
		contentType: "application/json; charset=utf-8",
		dataType: "json"
	});

	req.then(function( data ) {
		window.location = "/";
	});

	req.catch(function( data ) {
		const msg = data.responseJSON ? data.responseJSON.msg : "";
		alert("Username or Password wrong/not found (Error: " + msg + " )");
	});
}

// create user
function createUser() {
	const req = $.ajax({
		url: `/api/createuser`,
		method: "POST",
		data: JSON.stringify({
			username: $("#username").val(),
			password: $("#password").val(),
			password_confirm: $("#password_confirm").val(),
		}),
		contentType: "application/json; charset=utf-8",
		dataType: "json"
	});

	req.then(function( data ) {
		window.location = "/";
	});

	req.catch(function( data ) {
		const msg = data.responseJSON ? data.responseJSON.msg : "";
		alert("Error: " + msg);
	});
}

function refreshServerKeys() {
	const refresh = confirm("Are you sure you want to create a new pair of keys? This action cannot be undone. All peers will need new configs.");
	if (refresh) {
		const req = $.ajax({
			url: `/api/refreshserverkeys`,
			method: "POST"
		});

		req.then(function( data ) {
			$("#public_key").val(data.public_key);
		});

		req.catch(function( data ) {
			const msg = data.responseJSON ? data.responseJSON.msg : "";
			alert("could not generate new pair of keys: " + msg);
		});
	}
}

// restart wireguard
function saveAndRestart() {
	const req = $.ajax({
		url: `/api/saveandrestart`,
		method: "POST"
	});

	req.then(function( data ) {
		alert("config saved and wireguard restarted successfully");
		$('#alert-container').empty();
		$(".saveAndRestartBtn").removeClass("animated");
		toastShown = false;

		_config = config;
	});

	req.catch(function( data ) {
		const msg = data.responseJSON ? data.responseJSON.msg : "";
		alert("could not restart wireguard: " + msg);
	});
};

// retreive wireguard service logs
function retreiveLogs() {
	const req = $.ajax({
		url: `/api/getwireguardstatus`,
		method: "POST"
	});

	req.then(function( res ) {
		$("#logscode").html(res.data.replace(/\n/g, "<br />"));
	});

	req.catch(function( data ) {
		const msg = data.responseJSON ? data.responseJSON.msg : "";
		$("#logscode").html("could not get logs (error: " + msg + " )");
	});
};

// create a qr code of the peer
function makeQR(id) {
	document.getElementById("qrModalLabel").innerHTML = $(`#${id}`).find("input[name='device']").val();
	document.getElementById("qrcode").innerHTML = "";

	const qrcode = new QRCode(document.getElementById("qrcode"));

	$.get(`/api/download/${id}`, (data) => {
		qrcode.makeCode(data);
	});
};

function switchTrafficMode() {
	const req = $.ajax({
		url: `/api/switchtrafficmode`,
		method: "POST"
	});

	req.then(function( res ) {
		window.location = "/";
	});

	req.catch(function( data ) {
		const msg = data.responseJSON ? data.responseJSON.msg : "";
		alert("could not switch (error: " + msg + " )");
	});
}

// tooltip
$(function () {
	$("[data-toggle='tooltip']").tooltip();
});
