import React from 'react';
import { ipcRenderer } from 'electron';
import { Button, Input, Radio, Segment, Icon } from 'semantic-ui-react';
import cx from 'classnames';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import { SettingType, IpcEvents } from '@nuclear/core';
import { Dropdown, Range } from '@nuclear/ui';
import i18n from '@nuclear/i18n';

import Header from '../Header';
import Spacer from '../Spacer';

import styles from './styles.scss';
import { LastFmSocialIntegration } from './Integrations/LastFmSocialIntegration';
import { MastodonSocialIntegration } from './Integrations/MastodonSocialIntegration';
import { RootState } from '../../reducers';

const volumeSliderColors = {
  fillColor: { r: 248, g: 248, b: 242, a: 1 },
  trackColor: { r: 68, g: 71, b: 90, a: 1 },
  thumbColor: { r: 248, g: 248, b: 242, a: 1 }
};

export type SettingsProps = {
  actions: {
    setNumberOption: Function;
    setStringOption: Function;
    toggleOption: Function;
    fetchAllFmFavorites: React.MouseEventHandler;
    enableScrobbling: Function;
    disableScrobbling: Function;
    lastFmConnectAction: React.MouseEventHandler;
    lastFmLoginAction: (authToken: string) => void;
    lastFmLogOut: React.MouseEventHandler;
  };
  mastodonActions: {
    registerNuclear: (instanceUrl: string) => void;
    getAccessToken: (authorizationCode: string) => void;
    logOut: React.MouseEventHandler;
    mastodonPost: (content: string) => void;
  };
  scrobbling: RootState['scrobbling'];
  importfavs: RootState['importfavs'];
  mastodon: RootState['mastodon'];
  settings: RootState['settings'];
  options: object;
}

const Settings: React.FC<SettingsProps> = ({
  actions,
  mastodonActions,
  scrobbling,
  importfavs,
  mastodon,
  settings,
  options
}) => {
  const isChecked = (option) => {
    return typeof settings[option.name] !== 'undefined'
      ? settings[option.name]
      : option.default;
  };

  const getOptionValue = (option) => {
    return settings[option.name];
  };

  const validateNumberInput = (value) => {
    const intValue = _.parseInt(value);
    return _.isNull(value) || !_.isNaN(intValue);
  };

  const setDirectoryOption = async (option) => {
    const filePaths = await ipcRenderer.invoke(IpcEvents.OPEN_PATH_PICKER, {
      properties: ['openDirectory']
    });
    
    if (!_.isEmpty(filePaths)) {
      actions.setStringOption(option.name, _.head(filePaths));
    }
  };

  const handleSliderChange = (value, option) => {
    actions.setNumberOption(option.name, _.parseInt(value));
  };

  const renderNodeOption = (option) => {
    return option.node;
  };

  const renderListOption = ({ placeholder, options }) => (
    <Dropdown
      search
      selection
      placeholder={t(placeholder)}
      value={i18n.language}
      options={options}
      onChange={(e, { value }) => {
        i18n.changeLanguage(value as string);
        ipcRenderer.send('tray-menu-translations-update', {
          'play': i18n.t('command-palette:actions.play'),
          'pause': i18n.t('command-palette:actions.pause'),
          'next': i18n.t('command-palette:actions.next'),
          'previous': i18n.t('command-palette:actions.previous'),
          'quit': i18n.t('command-palette:actions.quit')
        });
      }}
    />
  );

  const renderRadioOption = (option, settings) => (
    <Radio
      toggle
      onChange={() => actions.toggleOption(option, settings)}
      checked={isChecked(option)} />
  );

  const renderStringOption = (option) => (
    <Input
      fluid
      value={getOptionValue(option)}
      onChange={
        e => actions.setStringOption(option.name, e.target.value)} />
  );

  const renderDirectoryOption = (option) => (
    <span
      className={styles.directory_option}>
      <span
        className={styles.directory_content}>
        {getOptionValue(option)}
      </span>
      <Button
        icon
        inverted
        labelPosition='left'
        onClick={() => setDirectoryOption(option)}>
        <Icon name={option.buttonIcon} color="purple"/>
        {t(option.buttonText)}
      </Button>
    </span>
  );

  const renderSliderOption = (option) => (
    <div className={styles.slider_container}>
      <label>{t('less')}</label>
      <Range
        value={getOptionValue(option) || option.default}
        min={option.min}
        max={option.max}
        fillColor={volumeSliderColors.fillColor}
        trackColor={volumeSliderColors.trackColor}
        thumbColor={volumeSliderColors.thumbColor}
        height={4}
        width='auto'
        onChange={(e) => handleSliderChange(e, option)}
        thumbSize={21} />
      <label>{t('more')}</label>
    </div>
  );

  const renderNumberOption = (option) => {
    if (typeof option.unit === 'string') {
      return renderSliderOption(option);
    } else {
      const value = getOptionValue(option);

      return (<Input
        type={typeof option.min === 'number' && typeof option.max === 'number' ? 'number' : 'text'}
        min={option.min}
        max={option.max}
        fluid
        value={value || option.default}
        error={!validateNumberInput(value)}
        onChange={
          e => !!e.target.value && validateNumberInput(value) && actions.setNumberOption(option.name, _.parseInt(e.target.value))
        }
      />);
    }
  };

  const renderOption = (settings, option, key) => (
    <div
      key={key}
      className={cx(
        styles.settings_item,
        option.type
      )}>
      <span className={styles.settings_item_text}>
        <label className={styles.settings_item_name}>
          {t(option.prettyName)}
        </label>
        {!_.isNil(option.description) &&
          <p className={styles.settings_item_description}>
            {t(option.description)}
          </p>}
      </span>
      <Spacer />
      {option.type === SettingType.BOOLEAN &&
        renderRadioOption(option, settings)}
      {option.type === SettingType.STRING &&
        renderStringOption(option)}
      {option.type === SettingType.NUMBER &&
        renderNumberOption(option)}
      {option.type === SettingType.LIST &&
        renderListOption(option)}
      {option.type === SettingType.NODE &&
        renderNodeOption(option)}
      {option.type === SettingType.DIRECTORY &&
        renderDirectoryOption(option)}
    </div>
  );

  const optionsGroups = _.groupBy(options, 'category');
  const { t } = useTranslation('settings');

  return (
    <div className={styles.settings_container}>
      <div className={styles.settings_section}>
        <Header>{t('social')}</Header>
        <hr />
        <LastFmSocialIntegration
          actions={actions}
          scrobbling={scrobbling}
          importfavs={importfavs}
        />
      </div>
      {_.map(optionsGroups, (group, i) => {
        const show = option => {
          return !option.hide;
        };
        if (group.some(show)) {
          return (
            <div key={i} className={styles.settings_section}>
              <Header>{t(i)}</Header>
              <hr />
              <Segment>
                {_.map(group, (option, j) => {
                  if (show(option)) {
                    return renderOption(settings, option, j);
                  }
                })}
              </Segment>
            </div>
          );
        }
      })}
    </div>
  );
};

export default Settings;
