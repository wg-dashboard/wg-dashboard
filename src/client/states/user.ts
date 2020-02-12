import {observable, action} from "mobx";

class User {
	@observable loggedIn = false;
	@observable admin = false;
	@observable pageIsLoading = false;

	@action setLoggedIn = (newState: boolean) => {
		this.loggedIn = newState;
	};

	@action setAdmin = (newState: boolean) => {
		this.admin = newState;
	};

	@action setPageIsLoading = (newState: boolean) => {
		this.pageIsLoading = newState;
	};
}

export default User;
