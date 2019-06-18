$(document).ready(() => {
	$("#peers").on("click", "button", (e) => {
		if ($(e.currentTarget).hasClass("editBtn")) {
			const tableRow = $(e.currentTarget).parent().parent();

			$(e.currentTarget)
				.html(`<i class="far fa-save fa-lg"></i>`)
				.removeClass("editBtn")
				.addClass("saveBtn")

			tableRow
				.find(".activeBtn")
				.attr("disabled", false);

			tableRow
				.find("input")
				.css("color", "#4285F4")
				.attr("disabled", false);
		} else if ($(e.currentTarget).hasClass("saveBtn")) {
			const tableRow = $(e.currentTarget).parent().parent();
			const data = {};

			tableRow.find("input").each(function () {
				data[this.name] = this.value;
			});

			const active = tableRow.find(".activeBtn");
			// console.log(active.hasClass("btn-danger"));
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
					.html(`<i class="far fa-edit"></i>`)
					.removeClass("saveBtn")
					.addClass("editBtn");

				tableRow
					.find("input")
					.css("color", "#495057")
					.attr("disabled", true);

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
				const tableRow = $(e.currentTarget).parent().parent();

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
				$(e.currentTarget).removeClass("btn-danger").addClass("btn-success").html(`<i class="fas fa-check"></i>`);
			} else {
				$(e.currentTarget).removeClass("btn-success").addClass("btn-danger").html(`<i class="fas fa-times"></i>`);
			}
		}
	});

	$("#server_settings").on("click", (e) => {
		if ($(e.currentTarget).hasClass("editBtn")) {
			$(e.currentTarget)
				.removeClass("editBtn")
				.removeClass("fa-edit")
				.addClass("saveBtn")
				.addClass("fa-save");
			$("#ip_address").attr("disabled", false).css("color", "#4285F4");
			$("#port").attr("disabled", false).css("color", "#4285F4");
			$("#cidr").attr("disabled", false).css("color", "#4285F4");
			$("#private_key").attr("disabled", false).css("color", "#4285F4");
			$("#network_adapter").attr("disabled", false).css("color", "#4285F4");
		} else if ($(e.currentTarget).hasClass("saveBtn")) {

			let ip_address = $("#ip_address").val();
			let port = $("#port").val();
			let cidr = $("#cidr").val();
			let private_key = $("#private_key").val();
			let network_adapter = $("#network_adapter").val();

			const req = $.ajax({
				url: `/api/server_settings/save`,
				method: "PUT",
				data: JSON.stringify(
					{
						ip_address: ip_address,
						port: port,
						cidr: cidr,
						private_key: private_key,
						network_adapter: network_adapter,
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
				$("#ip_address").attr("disabled", false).css("color", "#495057");
				$("#port").attr("disabled", false).css("color", "#495057");
				$("#cidr").attr("disabled", false).css("color", "#495057");
				$("#private_key").attr("disabled", false).css("color", "#495057");
				$("#network_adapter").attr("disabled", false).css("color", "#495057");
			});

			req.catch(function( data ) {
				const msg = data.responseJSON ? data.responseJSON.msg : ""
				alert("could not save data: " + msg);
			});
		}
	});
});


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
				<div class="my-auto">
					<button class="btn btn-dark btn-sm">
						<i class="fas fa-qrcode fa-lg"></i>
					</button>
				</div>
			</td>
			<td>
				<div class="my-auto">
					<button onclick="window.location='/api/download/${data.id}';" class="btn btn-dark btn-sm">
						<i class="fa fa-download fa-lg"></i>
					</button>
				</div>
			</td>
			<td>
				<button class="btn btn-success btn-sm activeBtn">
					<i class="fas fa-check fa-lg"></i>
				</button>
			</td>
			<td>
				<div class="md-form m-0">
					<input type="text" class="form-control" name="device" value=""></input>
				</div>
			</td>
			<td>
				<div class="md-form m-0">
					<input type="text" class="form-control" name="public_key" value=""></input>
				</div>
			</td>
			<td>
				<div class="md-form m-0">
					<input type="text" class="form-control" name="allowed_ips" value=""></input>
				</div>
			</td>
			<td>
				<button class="btn btn-dark btn-sm saveBtn">
					<i class="far fa-save fa-lg"></i>
				</button>
			</td>
			<td>
				<button class="btn btn-danger btn-sm deleteBtn">
					<i class="fas fa-trash fa-lg"></i>
				</button>
			</td>
		</tr>
		`);
	});

	req.catch(function( data ) {
		alert("could not save user");
	});
};
