const elements = {
  chip: document.getElementById('status-chip'),
  eyebrow: document.getElementById('status-eyebrow'),
  title: document.getElementById('status-title'),
  text: document.getElementById('status-text'),
  note: document.getElementById('progress-note'),
  helper: document.getElementById('status-helper'),
  retryButton: document.getElementById('retry-button'),
  simulateButton: document.getElementById('simulate-button'),
};

const states = {
  disconnected: {
    chip: 'Not connected',
    eyebrow: 'Connection interrupted',
    title: 'The service is not connected right now.',
    text: 'We could not reach the backend. The screen keeps people informed instead of leaving them stuck after pressing a button.',
    note: 'Connection check failed. You can retry immediately.',
    helper: 'Use this state when the API or database is unavailable.',
  },
  connected: {
    chip: 'Connected',
    eyebrow: 'Connection restored',
    title: 'Everything is connected and ready.',
    text: 'The connector locks in place once the service responds, giving a clear success state after loading finishes.',
    note: 'Health check passed. You can continue.',
    helper: 'Use this state after the request completes successfully.',
  },
  loading: {
    chip: 'Please wait',
    eyebrow: 'Preparing connection',
    title: 'Please wait while we set things up.',
    text: 'Buttons respond immediately with this loading screen, even when the server takes a little longer to finish the request.',
    note: 'Checking connection health and preparing your next step.',
    helper: 'Fast feedback is enabled. You should see a waiting state as soon as you press a button.',
  },
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function setButtonsDisabled(disabled) {
  elements.retryButton.disabled = disabled;
  elements.simulateButton.disabled = disabled;
}

function renderState(name, overrides = {}) {
  const state = { ...states[name], ...overrides };
  document.body.dataset.state = name;
  elements.chip.textContent = state.chip;
  elements.eyebrow.textContent = state.eyebrow;
  elements.title.textContent = state.title;
  elements.text.textContent = state.text;
  elements.note.textContent = state.note;
  elements.helper.textContent = state.helper;
}

async function pingHealth() {
  const response = await fetch('/health', {
    cache: 'no-store',
    headers: {
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Health check failed with ${response.status}`);
  }

  return response.json();
}

async function checkConnection() {
  renderState('loading', {
    title: 'Please wait while we verify the connection.',
    text: 'The page switches instantly into a loading state so users know the button press worked.',
    note: 'Running a live health check now.',
  });
  setButtonsDisabled(true);

  try {
    await sleep(700);
    const data = await pingHealth();

    renderState('connected', {
      note: `Health check passed at ${new Date(data.time).toLocaleTimeString()}.`,
      helper: 'Your button can show this success state after the request returns.',
    });
  } catch (error) {
    renderState('disconnected', {
      note: 'Health check failed. The backend did not answer successfully.',
      helper: 'This is the fallback page to show when the app cannot connect.',
    });
  } finally {
    setButtonsDisabled(false);
  }
}

async function simulateSlowAction() {
  renderState('loading', {
    chip: 'Please wait',
    eyebrow: 'Action in progress',
    title: 'We received your button press immediately.',
    text: 'This is the long-running state you asked for. Keep it visible while the server finishes the task in the background.',
    note: 'Simulating a slower response so users see progress instead of a frozen screen.',
    helper: 'Use this for uploads, AI screening, report generation, or any slow button action.',
  });
  setButtonsDisabled(true);

  try {
    await Promise.all([sleep(2600), pingHealth()]);

    renderState('connected', {
      eyebrow: 'Action complete',
      title: 'Your request finished successfully.',
      text: 'The loading screen can transition straight into a success state once the server responds.',
      note: 'Slow action completed.',
      helper: 'This gives users instant feedback first, then a clear finish state.',
    });
  } catch (error) {
    renderState('disconnected', {
      eyebrow: 'Action failed',
      title: 'The request could not finish because the service is unavailable.',
      text: 'The UI still acknowledged the button press immediately, but the server could not complete the action.',
      note: 'Slow action ended in a connection failure.',
      helper: 'Use this state when the request starts but the backend cannot complete it.',
    });
  } finally {
    setButtonsDisabled(false);
  }
}

const queryState = new URLSearchParams(window.location.search).get('state');

elements.retryButton.addEventListener('click', checkConnection);
elements.simulateButton.addEventListener('click', simulateSlowAction);

if (queryState && states[queryState]) {
  renderState(queryState);
} else {
  checkConnection();
}
