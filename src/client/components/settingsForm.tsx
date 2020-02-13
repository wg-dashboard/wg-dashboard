import React, {useEffect} from "react";
import {observable, action} from "mobx";
import {observer} from "mobx-react";
import {TextField, Button} from "@material-ui/core";
import {useForm} from "react-hook-form";
import {ISetting} from "../../server/interfaces";

import {getSettings, updateSettings} from "../api";

class SettingsState {
	@observable settings: ISetting[] = [];

	@action setSettings = (settings: ISetting[]) => (this.settings = settings);
}
const settingsState = new SettingsState();

export default observer(() => {
	const {handleSubmit, register, watch, errors} = useForm();
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
			console.log("initialSettings", initialSettings);
			settingsState.setSettings(initialSettings);
		};

		initializeSettings();
	}, []);

	return (
		<form onSubmit={handleSubmit(onSubmit)}>
			{settingsState.settings.length > 0 &&
				Object.values(settingsState.settings).map((el: any) => {
					console.log("rendering el...", JSON.stringify(el));
					const value = JSON.parse(el.value);
					return <TextField inputRef={register({required: true})} name={el.key} key={el.key} type={typeof value} defaultValue={value} />;
				})}

			<Button variant="contained" type="submit" size="large" color="primary">
				Save
			</Button>
		</form>
	);
});
