import React from "react";
import {Button} from "@material-ui/core";
import {useForm} from "react-hook-form";
import {loginRegisterUser} from "../api";
import Grid from "@material-ui/core/Grid";
import TextField from "@material-ui/core/TextField";

export default (props: {loggingIn: boolean}) => {
	const {handleSubmit, register, watch, errors} = useForm();
	const onSubmit = (data: any) => loginRegisterUser(data);

	return (
		<form onSubmit={handleSubmit(onSubmit)}>
			<Grid container direction="row" justify="center" alignItems="center">
				<TextField
					fullWidth
					margin="dense"
					label="Username"
					type="text"
					name={"name"}
					error={errors.username ? true : false}
					inputRef={register({required: true})}
				/>
				<TextField
					fullWidth
					margin="dense"
					label="Password"
					type="password"
					name={"password"}
					error={errors.password ? true : false}
					inputRef={register({required: true})}
				/>
				{!props.loggingIn && (
					<TextField
						fullWidth
						margin="dense"
						label="Confirm password"
						type="password"
						name={"passwordConfirm"}
						error={errors.passwordConfirm ? true : false}
						inputRef={register({
							required: true,
							validate: value => value === watch("password") || "Passwords do not match",
						})}
					/>
				)}
			</Grid>

			<Grid container direction="row" justify="flex-end" alignItems="center" style={{marginTop: "40px"}}>
				<Button variant="contained" type="submit" size="large" color="primary">
					{props.loggingIn ? "Login" : "Register"}
				</Button>
			</Grid>
		</form>
	);
};
