import {observable, action} from "mobx";

class User {
	@observable currLocation = "";
	@observable loggedIn = false;
	@observable admin = false;
	@observable pageIsLoading = false;
	@observable id = 0;

	@action setCurrLocation = (newState: string) => {
		this.currLocation = newState;
	};

	@action setLoggedIn = (newState: boolean) => {
		this.loggedIn = newState;
	};

	@action setAdmin = (newState: boolean) => {
		this.admin = newState;
	};

	@action setId = (id: number) => {
		this.id = id;
	};

	@action setPageIsLoading = (newState: boolean) => {
		this.pageIsLoading = newState;
	};
}

export default User;
