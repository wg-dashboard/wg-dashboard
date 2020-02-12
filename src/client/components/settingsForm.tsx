import React, {useEffect} from "react";
import {observable, action} from "mobx";
import {observer} from "mobx-react";

import states from "../states/index";
import {getSettings} from "../api";

interface IKeyValue {
	[key: string]: string;
}

class SettingsState {
	@observable settings: IKeyValue[] = [];

	@action setSettings = (settings: IKeyValue[]) => (this.settings = settings);
}
const settingsState = new SettingsState();

export default observer(() => {
	useEffect(() => {
		const initializeSettings = async () => {
			const initialSettings = await getSettings();
			settingsState.setSettings(initialSettings);
		};

		initializeSettings();
	}, []);

	return (
		<div>
			{settingsState.settings.length > 0 &&
				Object.values(settingsState.settings).map((el: any) => (
					<div key={el.key}>
						{el.key}: {el.value}
					</div>
				))}
		</div>
	);
});
