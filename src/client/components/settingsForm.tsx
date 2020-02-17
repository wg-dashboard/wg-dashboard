import React, {useEffect} from "react";
import {observable, action} from "mobx";
import {observer} from "mobx-react";
import {Input, Button, InputLabel, Paper, Typography, Container, TextField, Grid} from "@material-ui/core";
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
			} as ISetting;
		});
		settingsState.setSettings(_data);
	};

	useEffect(() => {
		const initializeSettings = async () => {
			const initialSettings = await getSettings();
			settingsState.setSettings(initialSettings);
		};

		initializeSettings();
	}, []);

	console.log(JSON.stringify(settingsState.settings));

	return (
		<Paper style={{paddingTop: "10px", paddingBottom: "16px"}}>
			<Container>
				<Typography variant="h3" gutterBottom>
					Settings
				</Typography>
				<form onSubmit={handleSubmit(onSubmit)}>
					<Grid container spacing={3}>
						<Grid container item md={12} lg={4}>
							{settingsState.settings.find(el => el.key === "ip_address") ? (
								<Controller
									as={<TextField />}
									fullWidth
									variant="outlined"
									label="IP Address"
									id={"settings_input_" + settingsState.settings.find(el => el.key === "ip_address")?.key}
									InputLabelProps={{
										shrink: true,
									}}
									control={control}
									inputRef={register({required: true})}
									name={settingsState.settings.find(el => el.key === "ip_address")?.key}
									type={typeof JSON.parse(settingsState.settings.find(el => el.key === "ip_address")?.value)}
									defaultValue={JSON.parse(settingsState.settings.find(el => el.key === "ip_address")?.value)}
								/>
							) : null}
						</Grid>

						<Grid container item md={12} lg={4}>
							{settingsState.settings.find(el => el.key === "port") ? (
								<Controller
									as={<TextField />}
									fullWidth
									variant="outlined"
									label="Port"
									id={"settings_input_" + settingsState.settings.find(el => el.key === "port")?.key}
									InputLabelProps={{
										shrink: true,
									}}
									control={control}
									inputRef={register({required: true})}
									name={settingsState.settings.find(el => el.key === "port")?.key}
									type={typeof JSON.parse(settingsState.settings.find(el => el.key === "port")?.value)}
									defaultValue={JSON.parse(settingsState.settings.find(el => el.key === "port")?.value)}
								/>
							) : null}
						</Grid>

						<Grid container item md={12} lg={4}>
							{settingsState.settings.find(el => el.key === "network_adapter") ? (
								<Controller
									as={<TextField />}
									fullWidth
									variant="outlined"
									label="Network Adapter"
									id={"settings_input_" + settingsState.settings.find(el => el.key === "network_adapter")?.key}
									InputLabelProps={{
										shrink: true,
									}}
									control={control}
									inputRef={register({required: true})}
									name={settingsState.settings.find(el => el.key === "network_adapter")?.key}
									type={typeof JSON.parse(settingsState.settings.find(el => el.key === "network_adapter")?.value)}
									defaultValue={JSON.parse(settingsState.settings.find(el => el.key === "network_adapter")?.value)}
								/>
							) : null}
						</Grid>

						<Grid container item md={12} lg={4}>
							{settingsState.settings.find(el => el.key === "virtual_ip_address") ? (
								<Controller
									as={<TextField />}
									fullWidth
									variant="outlined"
									label="Virtual Address"
									id={"settings_input_" + settingsState.settings.find(el => el.key === "virtual_ip_address")?.key}
									InputLabelProps={{
										shrink: true,
									}}
									control={control}
									inputRef={register({required: true})}
									name={settingsState.settings.find(el => el.key === "virtual_ip_address")?.key}
									type={typeof JSON.parse(settingsState.settings.find(el => el.key === "virtual_ip_address")?.value)}
									defaultValue={JSON.parse(settingsState.settings.find(el => el.key === "virtual_ip_address")?.value)}
								/>
							) : null}
						</Grid>

						<Grid container item md={12} lg={4}>
							{settingsState.settings.find(el => el.key === "cidr") ? (
								<Controller
									as={<TextField />}
									fullWidth
									variant="outlined"
									label="CIDR"
									id={"settings_input_" + settingsState.settings.find(el => el.key === "cidr")?.key}
									InputLabelProps={{
										shrink: true,
									}}
									control={control}
									inputRef={register({required: true})}
									name={settingsState.settings.find(el => el.key === "cidr")?.key}
									type={typeof JSON.parse(settingsState.settings.find(el => el.key === "cidr")?.value)}
									defaultValue={JSON.parse(settingsState.settings.find(el => el.key === "cidr")?.value)}
								/>
							) : null}
						</Grid>

						<Grid container item md={12} lg={4}>
							{settingsState.settings.find(el => el.key === "dns") ? (
								<Controller
									as={<TextField />}
									fullWidth
									variant="outlined"
									label="DNS"
									id={"settings_input_" + settingsState.settings.find(el => el.key === "dns")?.key}
									InputLabelProps={{
										shrink: true,
									}}
									control={control}
									inputRef={register({required: true})}
									name={settingsState.settings.find(el => el.key === "dns")?.key}
									type={typeof JSON.parse(settingsState.settings.find(el => el.key === "dns")?.value)}
									defaultValue={JSON.parse(settingsState.settings.find(el => el.key === "dns")?.value)}
								/>
							) : null}
						</Grid>

						<Grid container item md={12}>
							{settingsState.settings.find(el => el.key === "public_key") ? (
								<Controller
									as={<TextField />}
									fullWidth
									variant="outlined"
									label="Public Key"
									id={"settings_input_" + settingsState.settings.find(el => el.key === "public_key")?.key}
									InputLabelProps={{
										shrink: true,
									}}
									control={control}
									inputRef={register({required: true})}
									name={settingsState.settings.find(el => el.key === "public_key")?.key}
									type={typeof JSON.parse(settingsState.settings.find(el => el.key === "public_key")?.value)}
									defaultValue={JSON.parse(settingsState.settings.find(el => el.key === "public_key")?.value)}
								/>
							) : null}
						</Grid>

						<Grid container item md={12} lg={4}>
							{settingsState.settings.find(el => el.key === "config_path") ? (
								<Controller
									as={<TextField />}
									fullWidth
									variant="outlined"
									label="Config Path"
									id={"settings_input_" + settingsState.settings.find(el => el.key === "config_path")?.key}
									InputLabelProps={{
										shrink: true,
									}}
									control={control}
									inputRef={register({required: true})}
									name={settingsState.settings.find(el => el.key === "config_path")?.key}
									type={typeof JSON.parse(settingsState.settings.find(el => el.key === "config_path")?.value)}
									defaultValue={JSON.parse(settingsState.settings.find(el => el.key === "config_path")?.value)}
								/>
							) : null}
						</Grid>

						<Grid container item md={12} lg={4}>
							{settingsState.settings.find(el => el.key === "webserver_port") ? (
								<Controller
									as={<TextField />}
									fullWidth
									variant="outlined"
									label="Webserver Port"
									id={"settings_input_" + settingsState.settings.find(el => el.key === "webserver_port")?.key}
									InputLabelProps={{
										shrink: true,
									}}
									control={control}
									inputRef={register({required: true})}
									name={settingsState.settings.find(el => el.key === "webserver_port")?.key}
									type={typeof JSON.parse(settingsState.settings.find(el => el.key === "webserver_port")?.value)}
									defaultValue={JSON.parse(settingsState.settings.find(el => el.key === "webserver_port")?.value)}
								/>
							) : null}
						</Grid>

						<Grid container item md={12} lg={4}>
							{settingsState.settings.find(el => el.key === "allowed_ips") ? (
								<Controller
									as={<TextField />}
									fullWidth
									variant="outlined"
									label="Allowed IP's"
									id={"settings_input_" + settingsState.settings.find(el => el.key === "allowed_ips")?.key}
									InputLabelProps={{
										shrink: true,
									}}
									control={control}
									inputRef={register({required: true})}
									name={settingsState.settings.find(el => el.key === "allowed_ips")?.key}
									type={typeof JSON.parse(settingsState.settings.find(el => el.key === "allowed_ips")?.value)}
									defaultValue={JSON.parse(settingsState.settings.find(el => el.key === "allowed_ips")?.value)}
								/>
							) : null}
						</Grid>

						<Grid container item md={12} direction="row" justify="flex-end">
							<Button variant="contained" type="submit" size="large" color="primary">
								Save
							</Button>
						</Grid>
					</Grid>
				</form>

				{/* {settingsState.settings.length > 0 &&
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
					})} */}
			</Container>
		</Paper>
	);
});
