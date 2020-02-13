import React, {useEffect} from "react";
import {observable, action} from "mobx";
import {observer} from "mobx-react";
import {Input, Button, InputLabel} from "@material-ui/core";
import {useForm, Controller} from "react-hook-form";
import {ISetting} from "../../server/interfaces";

import {getSettings, updateSettings} from "../api";

class SettingsState {
	@observable settings: ISetting[] = [];

	@action setSettings = (settings: ISetting[]) => (this.settings = settings);
}
const settingsState = new SettingsState();

export default observer(() => {
	const {handleSubmit, control, register, watch, errors} = useForm();
	const onSubmit = async (data: any) => {
		await updateSettings(data);

		const _data: ISetting[] = Object.entries(data).map(([key, value]) => {
			return {
				key,
				value: JSON.stringify(value),
			};
		});
		settingsState.setSettings(_data);
	};

	useEffect(() => {
		const initializeSettings = async () => {
			const initialSettings = await getSettings();
			console.log(initialSettings);
			settingsState.setSettings(initialSettings);
		};

		initializeSettings();
	}, []);

	return (
		<form onSubmit={handleSubmit(onSubmit)}>
			{settingsState.settings.length > 0 &&
				Object.values(settingsState.settings).map((el: any) => {
					const value = JSON.parse(el.value);

					return (
						<div key={el.key}>
							<InputLabel htmlFor={"settings_input_" + el.key}>{el.key}</InputLabel>
							<Controller
								as={<Input />}
								id={"settings_input_" + el.key}
								control={control}
								inputRef={register({required: true})}
								name={el.key}
								type={typeof value}
								defaultValue={value}
								disabled={el.key === "public_key" ? true : false}
							/>
						</div>
					);
				})}

			<Button variant="contained" type="submit" size="large" color="primary">
				Save
			</Button>
		</form>
	);
});
