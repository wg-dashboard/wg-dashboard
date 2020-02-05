import {Input, Button} from "@material-ui/core";
import {useForm} from "react-hook-form";
import {loginRegisterUser} from "./api";

interface IProps {
	loggingIn: boolean;
}

export default (props: IProps) => {
	const {handleSubmit, register, watch, errors} = useForm();
	const onSubmit = (data: any) => loginRegisterUser(data);

	return (
		<form onSubmit={handleSubmit(onSubmit)}>
			<Input type="text" name={"name"} placeholder="Username.." error={errors.username ? true : false} inputRef={register({required: true})} />
			<Input type="password" name={"password"} placeholder="Password.." error={errors.password ? true : false} inputRef={register({required: true})} />
			{!props.loggingIn && (
				<Input
					type="password"
					name="passwordConfirm"
					placeholder="Password confirmation.."
					error={errors.passwordConfirm ? true : false}
					inputRef={register({
						required: true,
						validate: value => value === watch("password") || "Passwords do not match",
					})}
				/>
			)}

			<Button variant="text" type="submit">
				{props.loggingIn ? "Login" : "Register"}
			</Button>
		</form>
	);
};
