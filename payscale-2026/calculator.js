(() => {
  const form = document.querySelector('#calculator-form');
  const error = document.querySelector('#form-error');
  const outputs = {
    difference: document.querySelector('#difference-output'),
    phaseOne: document.querySelector('#phase-one-output'),
    phaseTwo: document.querySelector('#phase-two-output'),
    phaseThree: document.querySelector('#phase-three-output'),
    target: document.querySelector('#target-output')
  };
  const money = new Intl.NumberFormat('en-BD', {style:'currency', currency:'BDT', maximumFractionDigits:0});
  const value = (id) => Number(document.querySelector(id).value);

  function calculate(event) {
    if (event) event.preventDefault();
    error.textContent = '';
    const current = value('#current-basic');
    const target = value('#target-basic');
    const phaseOne = value('#phase-one');
    const phaseTwo = value('#phase-two');
    const phaseThree = value('#phase-three');
    const phases = [phaseOne, phaseTwo, phaseThree];
    if (![current, target, ...phases].every(Number.isFinite) || current < 0 || target < 0 || phases.some((item) => item < 0 || item > 100)) {
      error.textContent = 'Enter valid non-negative pay values and phase shares from 0 to 100.';
      return;
    }
    if (target < current) {
      error.textContent = 'The target basic pay must be equal to or higher than the current basic pay for this scenario.';
      return;
    }
    if (!(phaseOne <= phaseTwo && phaseTwo <= phaseThree)) {
      error.textContent = 'Phase shares should be entered in non-decreasing order.';
      return;
    }
    const difference = target - current;
    const staged = phases.map((share) => current + difference * (share / 100));
    outputs.difference.textContent = money.format(difference);
    outputs.phaseOne.textContent = money.format(staged[0]);
    outputs.phaseTwo.textContent = money.format(staged[1]);
    outputs.phaseThree.textContent = money.format(staged[2]);
    outputs.target.textContent = money.format(target);
  }

  function reset() {
    error.textContent = '';
    Object.values(outputs).forEach((output) => { output.textContent = '—'; });
  }

  form.addEventListener('submit', calculate);
  form.addEventListener('reset', () => window.setTimeout(reset, 0));
})();

