$(document).ready(() => {
	$("#peers").on("click", "button", (e) => {
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
			const tableRow = $(e.currentTarget).parent().parent();
			const data = {id: tableRow[0].id};

			tableRow.find("input").each(function () {
				data[this.name] = this.value;
			});

			$.ajax({
				url: "/api/createpeer",
				method: "POST",
				data: JSON.stringify(data),
				contentType: "application/json; charset=utf-8",
				dataType: "json",
			}).done(function() {
				$(e.currentTarget)
					.html(`<i class="far fa-edit"></i>`)
					.removeClass("saveBtn")
					.addClass("editBtn");

				tableRow
					.find("input")
					.attr("disabled", true);
			});
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
			let data = $(e.currentTarget).parent().parent().find("input").val();

			console.log(id, data);

			// const tableRow = $(e.currentTarget).parent().parent();
			// const data = {id: tableRow[0].id};

			// tableRow.find("input").each(function () {
			// 	data[this.name] = this.value;
			// });

			// $.ajax({
			// 	url: "/api/createpeer",
			// 	method: "POST",
			// 	data: JSON.stringify(data),
			// 	contentType: "application/json; charset=utf-8",
			// 	dataType: "json",
			// }).done(function() {
			// 	$(e.currentTarget)
			// 		.html(`<i class="far fa-edit"></i>`)
			// 		.removeClass("saveBtn")
			// 		.addClass("editBtn");

			// 	tableRow
			// 		.find("input")
			// 		.attr("disabled", true);
			// });
		}
	});


});


function createNewPeer() {
	// get the highest id available
	const IDs = [];
	$("#peers").find("tr").each(function() {
		IDs.push(parseInt(this.id, 10));
	});

	// count one up
	const id = Math.max(...IDs) + 1;

	$("#peers").append(`
	<tr class="text-center p-2" id=${id}>
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
	</tr>
	`);
}
