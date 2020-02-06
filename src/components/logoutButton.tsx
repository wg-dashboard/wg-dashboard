import {Button} from "@material-ui/core";
import {logout} from "./api";

export default () => {
	return (
		<Button variant="outlined" onClick={() => logout()}>
			Logout
		</Button>
	);
};
