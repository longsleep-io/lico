import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import renderIf from 'render-if';
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl';

import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import green from '@material-ui/core/colors/green';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';

import { updateInput, executeLogonIfFormValid, advanceLogonFlow } from '../../actions/login';
import { ErrorMessage } from '../../errors';

const styles = theme => ({
  button: {
    margin: theme.spacing(1),
    minWidth: 100
  },
  buttonProgress: {
    color: green[500],
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -12,
    marginLeft: -12
  },
  subHeader: {
    marginBottom: theme.spacing(3)
  },
  wrapper: {
    position: 'relative',
    display: 'inline-block'
  },
  slideContainer: {
    overflowX: 'hidden',
  },
  message: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2)
  }
});

const loginTranslations = defineMessages({
  login_username_placeholder: {
    id: 'konnect.login.usernameField.placeholder',
    defaultMessage: 'Username'
  },
  login_password_placeholder: {
    id: 'konnect.login.passwordField.label',
    defaultMessage: 'Password'
  },
});

function Login(props) {
  const {
    hello,
    query,
    dispatch,
    history,
    loading,
    errors,
    classes,
    username,
    password,
    intl,
  } = props;

  useEffect(() => {
    if (hello && hello.state && history.action !== 'PUSH') {
      if (!query.prompt || query.prompt.indexOf('select_account') === -1) {
        dispatch(advanceLogonFlow(true, history));
        return;
      }

      history.replace(`/chooseaccount${history.location.search}${history.location.hash}`);
      return;
    }
  }, [ /* no dependencies */ ]);

  const handleChange = (name) => (event) => {
    dispatch(updateInput(name, event.target.value));
  };

  const handleNextClick = (event) => {
    event.preventDefault();

    dispatch(executeLogonIfFormValid(username, password, false)).then((response) => {
      if (response.success) {
        dispatch(advanceLogonFlow(response.success, history));
      }
    });
  };

  const usernamePlaceHolder = hello?.details?.branding?.usernameHintText ? hello.details.branding.usernameHintText : intl.formatMessage(loginTranslations.login_username_placeholder);

  return (
    <DialogContent>
      <Typography variant="h5" component="h3" gutterBottom>
        <FormattedMessage id="konnect.login.headline" defaultMessage="Sign in"></FormattedMessage>
      </Typography>

      <form action="" onSubmit={(event) => this.logon(event)}>
        <TextField
          placeholder={usernamePlaceHolder}
          error={!!errors.username}
          helperText={<ErrorMessage error={errors.username} values={{what: usernamePlaceHolder.charAt(0).toLowerCase() + usernamePlaceHolder.slice(1)}}></ErrorMessage>}
          fullWidth
          margin="dense"
          autoFocus
          inputProps={{
            autoCapitalize: 'off',
            spellCheck: 'false'
          }}
          value={username}
          onChange={handleChange('username')}
          autoComplete="kopano-account username"
        />
        <TextField
          type="password"
          placeholder={intl.formatMessage(loginTranslations.login_password_placeholder)}
          error={!!errors.password}
          helperText={<ErrorMessage error={errors.password}></ErrorMessage>}
          fullWidth
          margin="dense"
          onChange={handleChange('password')}
          autoComplete="kopano-account current-password"
        />
        <DialogActions>
          <div className={classes.wrapper}>
            <Button
              type="submit"
              color="primary"
              variant="contained"
              className={classes.button}
              disabled={!!loading}
              onClick={handleNextClick}
            >
              <FormattedMessage id="konnect.login.nextButton.label" defaultMessage="Next"></FormattedMessage>
            </Button>
            {loading && <CircularProgress size={24} className={classes.buttonProgress} />}
          </div>
        </DialogActions>

        {renderIf(errors.http)(() => (
          <Typography variant="subtitle2" color="error" className={classes.message}>
            <ErrorMessage error={errors.http}></ErrorMessage>
          </Typography>
        ))}

        {hello?.details?.branding?.signinPageText && <Typography variant="body2">{hello.details.branding.signinPageText}</Typography>}
      </form>
    </DialogContent>
  );
}

Login.propTypes = {
  classes: PropTypes.object.isRequired,
  intl: PropTypes.object.isRequired,

  loading: PropTypes.string.isRequired,
  username: PropTypes.string.isRequired,
  password: PropTypes.string.isRequired,
  errors: PropTypes.object.isRequired,
  branding: PropTypes.object,
  hello: PropTypes.object,
  query: PropTypes.object.isRequired,

  dispatch: PropTypes.func.isRequired,
  history: PropTypes.object.isRequired
};

const mapStateToProps = (state) => {
  const { loading, username, password, errors} = state.login;
  const { branding, hello, query } = state.common;

  return {
    loading,
    username,
    password,
    errors,
    branding,
    hello,
    query
  };
};

export default connect(mapStateToProps)(withStyles(styles)(injectIntl(Login)));
