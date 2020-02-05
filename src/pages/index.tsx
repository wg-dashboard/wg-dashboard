import {useState} from "react";
import {Button} from "@material-ui/core";

import Login from "../components/loginForm";

export default () => {
	const [loggingIn, setLoggingIn] = useState(true);

	return (
		<div>
			Welcome!
			<div>Do you want to login or register?</div>
			<Button variant="contained" color="primary" onClick={() => setLoggingIn(true)}>
				Login
			</Button>
			<Button variant="outlined" color="primary" onClick={() => setLoggingIn(false)}>
				Register
			</Button>
			<Login loggingIn={loggingIn} />
		</div>
	);
};
