$(document).ready(() => {
	$("#peers").on("click", "button", (e) => {
		if ($(e.currentTarget).hasClass("editBtn")) {
			const tableRow = $(e.currentTarget).parent().parent();

			$(e.currentTarget)
				.html(`<i class="far fa-save"></i>`)
				.removeClass("editBtn")
				.addClass("saveBtn")

			tableRow
				.find("input")
				.attr("disabled", false);
		} else if ($(e.currentTarget).hasClass("saveBtn")) {
			const tableRow = $(e.currentTarget).parent().parent();
			const data = {};

			tableRow.find("input").each(function () {
				data[this.name] = this.value;
			});

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
					.attr("disabled", true);
			});

			req.catch(function( data ) {
				alert("could not save user");
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
					alert("could not delete user");
				});
			}
		}
	});

	$("#server_settings").on("click", "button", (e) => {
		if ($(e.currentTarget).hasClass("editBtn")) {
			$(e.currentTarget)
				.html(`<i class="far fa-save"></i>`)
				.removeClass("editBtn")
				.addClass("saveBtn")
				.parent()
				.parent()
				.find("input")
				.attr("disabled", false);
		} else if ($(e.currentTarget).hasClass("saveBtn")) {

			let id = e.currentTarget.id;
			let input = $(e.currentTarget).parent().parent().find("input");
			let data = $(e.currentTarget).parent().parent().find("input").val();

			const req = $.ajax({
				url: `/api/server_settings/${id}`,
				method: "PUT",
				data: JSON.stringify({data: data}),
				contentType: "application/json; charset=utf-8",
				dataType: "json"
			});

			req.then(function( data ) {
				$(e.currentTarget)
					.html(`<i class="far fa-edit"></i>`)
					.removeClass("saveBtn")
					.addClass("editBtn");
				input
					.attr("disabled", true);
			});

			req.catch(function( data ) {
				alert("could not save data");
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
	})

	req.then(function( data ) {
		$("#peers").append(`<tr class="text-center p-2" id=${data.id}>
			<td><div class="btn btn-success" disabled><i class="fa fa-download"></i></div></td>
			<th scope="row">
				<button class="btn btn-danger w-100">
					<i class="fas fa-times"></i>
				</button>
			</th>
			<td><input class="btn w-100 border-dark" name="device"></input></td>
			<td><input class="btn w-100 border-dark" name="public_key"></input></td>
			<td><input class="btn w-100 border-dark" name="allowed_ips"></input></td>
			<td>
				<button class="btn btn-dark w-100 saveBtn">
					<i class="far fa-save"></i>
				</button>
			</td>
			<td>
				<button class="btn btn-danger w-100 deleteBtn">
					<i class="fas fa-trash"></i>
				</button>
			</td>
		</tr>`);
	});

	req.catch(function( data ) {
		alert("could not save user");
	});
};
