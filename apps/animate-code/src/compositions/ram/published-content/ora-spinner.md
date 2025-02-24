## !!steps

!duration 100

```jsx ! a
// !callout[/ora/] The `ora` package is used to create a spinner in the console. Here, we initialize a spinner with the text "Loading unicorns" and start it immediately. The spinner instance is stored in the `spinner` variable.
import ora from 'ora';

const spinner = ora('Loading unicorns').start();
```

## !!steps

!duration 100

```jsx ! a
import ora from 'ora';

// !callout[/ora/] Here, we initialize a spinner with the text "Loading unicorns" and start it immediately. The spinner instance is stored in the `spinner` variable.
const spinner = ora('Loading unicorns').start();
```

## !!steps

!duration 100

```jsx ! a
import ora from 'ora';

const spinner = ora('Loading unicorns').start();

// !callout[/setTimeout/] After one second, we update the spinner's color to yellow and change the text to "Loading rainbows". This shows how you can dynamically update the spinner's appearance while it's running.
setTimeout(() => {
	spinner.color = 'yellow';
	spinner.text = 'Loading rainbows';
}, 1000);

```