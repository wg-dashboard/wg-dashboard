$(document).ready(() => {
	$(".editBtn").on("click", (e) => {
		$(e.currentTarget)
			.html("SAVE")
			.removeClass("editBtn")
			.addClass("saveBtn")
			.parent()
			.parent()
			.find("input")
			.attr("disabled", false);
	});
});

function createNewPeer() {
	console.log($("#peers"));
	$("#peers").append(`<tr class="text-center p-2">
		<th scope="row">
			<button class="btn btn-danger w-100">
				<i class="fas fa-times"></i>
			</button>
		</th>
		<td><input class="btn w-100 border-dark"></input></td>
		<td><input class="btn w-100 border-dark"></input></td>
		<td><input class="btn w-100 border-dark"></input></td>
		<td>
			<button class="btn btn-dark w-100">
				SAVE
			</button>
		</td>
	</tr>`);
}
