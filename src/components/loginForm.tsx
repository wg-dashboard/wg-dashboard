import {Input, Button} from "@material-ui/core";
import {useForm} from "react-hook-form";
// import {signIn} from "../pages/api";

interface IProps {
	loggingIn: boolean;
}

export default (props: IProps) => {
	const {handleSubmit, register} = useForm();
	const onSubmit = (data: any) => console.log(data);

	return (
		<form onSubmit={handleSubmit(onSubmit)}>
			<Input type="text" name={"username"} placeholder="Username.." inputRef={register({required: true})} />
			<Input type="password" name={"password"} placeholder="Password.." inputRef={register({required: true})} />
			{!props.loggingIn && (
				<Input
					type="password"
					name="passwordconfirm"
					placeholder="Password confirmation.."
					inputRef={register({required: true})}
				/>
			)}

			<Button variant="text" type="submit">
				{props.loggingIn ? "Login" : "Register"}
			</Button>
		</form>
	);
};
