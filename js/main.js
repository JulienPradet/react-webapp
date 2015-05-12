(function() {
	var tag = "app_";
	/* Layout of the page */
	var Panel = React.createClass({
		render: function() {
			/* Classes */
			/* Panel + panel size */
			var panelClass="panel"+(typeof this.props.type !== "undefined" ? "--"+this.props.type : "")+" panel--"+this.props.size;
			/* Panel hidden */
			if(typeof this.props.hide !== "undefined" && this.props.hide !== "") panelClass += " panel--hidden panel--"+this.props.size+"--hidden--to-left";
			/* Panel order/zIndex this higher, the more visible */
			if(typeof this.props.zIndex !== "undefined") panelClass += " panel--zIndex-"+this.props.zIndex;
			/* Scollable */
			if(typeof this.props.scrollable !== "undefined") {
				if(this.props.scrollable.x) panelClass += " panel--scroll-x";
				if(this.props.scrollable.y) panelClass += " panel--scroll-y";
			}

			return (
				<div className={(typeof this.props.className !== "undefined" ? this.props.className + " " : "") + panelClass}>{this.props.children}</div>
			);
		}
	});

	/* Makes it possible to have a panel that will be hidden by css */
	var ToggablePanel = React.createClass({
		getInitialState: function() {
			return {
				opened: true,
			}
		},
		handleToggle: function(event) {
			this.setState({
				opened: !this.state.opened
			});
		},
		render: function() {
			menuSize = 2;
			contentSize = (this.state.opened ? 8 : 10);
			return (
				<Panel size="10">
					<Panel zIndex="1" size={menuSize} hide={this.state.opened ? "" : "left"} opened={this.state.opened}>
						{React.createElement(this.props.toggler, {handleToggle: this.handleToggle})}
					</Panel>

					<Panel scrollable={{x: false, y: true}} zIndex="0" className="content" size={contentSize}>
						{this.props.children}
					</Panel>
				</Panel>
			);
		}
	});


	/* Menu (left panel) */
	var AppMenu = React.createClass({
		render: function() {
			return (
				<div className="menu">
					<div className="menu__header">
						<button className="menu__toggle-button" onClick={this.props.handleToggle}><span className="menu__toggle-button__label">Toggle</span> ≡</button>
						<h2>Menu</h2>
					</div>
				</div>
			);
		}
	});

	/*
	 * Form wrapper
	 * While using this, the user doesn't have to think about css
	 */
	var Form = React.createClass({
		render: function() {
			return (
				<form onSubmit={this.props.onSubmit} className="form">
					{this.props.children}
				</form>
			);
		}
	});

	/*
	 * Wraps a label + an input
	 */
	var LabelledInput = React.createClass({
		render: function() {
			return (
				<div className={(typeof this.props.className ? this.props.className : "") + " form__group"}>
					<div className="form__group__label">
						<label htmlFor={this.props.id}>{this.props.label}</label>
					</div>
					<div className="form__group__input">
						<input value={this.props.value} type={this.props.type} name={this.props.id} id={this.props.id} onChange={this.props.onChange} />
					</div>
				</div>
			)
		}
	});

	/* Wraps a Submit button */
	var Submit = React.createClass({
		render: function() {
			return (
				<button className={this.props.className} type="submit">{this.props.children}</button>
			);
		}
	});

	/*
	 * Command line (top right panel)
	 */
	var CommandLine = React.createClass({
		getInitialState: function() {
			return { value: "" }
		},
		onChange: function(event) {
			this.setState({value: event.target.value});
		},
		submitCommand: function(e) {
			e.preventDefault();
			var event = new CustomEvent(tag+"new_command", {
				detail: {
					value: this.state.value
				}
			});
			document.dispatchEvent(event);
			this.setState(this.getInitialState());
		},
		render: function() {
			return (
				<div className="command">
					<Form onSubmit={this.submitCommand}>
						<LabelledInput value={this.state.value} className="command__input" id="command-input" label="Command" type="text" onChange={this.onChange} />
						<Submit className="hidden">Launch</Submit>
					</Form>
				</div>
			);
		}
	})

	var Result = React.createClass({
		render: function() {
			return(
				<div className="result">
					<div className="result__command">
						<span className="result__command__label">Command</span>
						<span className="result__command__value">{this.props.data.command}</span>
					</div>
					<div className="result__result">
						<span className="result__result__label">Result</span>
						<span className="result__result__value">{this.props.data.result}</span>
					</div>
				</div>
			);
		}
	});

	/* Results (main part) */
	var ResultList = React.createClass({
		calculateResult: function(id, command) {
			var f = new Function("return "+command);
			var result;
			try {
				result = f();
			} catch(err) {
				// console.err(err);
				result = "undefined";
			}
			return {
				id: id,
				command: command,
				result: result
			}
		},
		newCommand: function newCommand(e) {
			var command = e.detail.value,
					currentResults = this.state.results;
			var result = this.calculateResult(currentResults.length, command);
			currentResults.unshift(result);
			this.setState({
				results: currentResults
			})
		},
		getInitialState: function() {
			return {
				results: []
			};
		},
		componentDidMount: function() {
			document.addEventListener(tag+"new_command", this.newCommand, false);
		},
		componentWillUnmount: function() {
			document.removeEventListener(tag+"new_command", this.newCommand, false);
		},
		render: function() {
			var results = this.state.results.map(function(result) {
				return <Result key={result.id} data={result} />
			});
			return(
				<div id={tag+"result_handler"} className="results">
					{results}
				</div>
			);
		}
	});

	var App = React.createClass({
		render: function() {
			return (
				<ToggablePanel toggler={AppMenu}>
					<CommandLine />
					<ResultList />
				</ToggablePanel>
			);
		}
	})

	React.render(
		<App />,
		document.getElementById('react-container')
	);
})();