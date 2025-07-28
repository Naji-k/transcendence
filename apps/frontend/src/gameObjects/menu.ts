import { AdvancedDynamicTexture, Rectangle, TextBlock, Control, Button } from "@babylonjs/gui";
import { Scene, ActionManager, ExecuteCodeAction, KeyboardEventTypes } from "@babylonjs/core";
import { Game } from "./game";

export class GameMenu
{
	private advancedTexture: AdvancedDynamicTexture;
	private menuContainer: Rectangle;
	private buttons: Button[] = [];
	private selectedIndex;
	private isVisible;
	private scene: Scene;
	private game: Game;

	constructor(scene: Scene, game: Game)
	{
		this.scene = scene;
		this.game = game;
		this.selectedIndex = 0;
		this.isVisible = false;
		this.advancedTexture = AdvancedDynamicTexture.CreateFullscreenUI("UI");
		this.menuContainer = new Rectangle();
		this.setupGUI();
		this.setupKeyboardInput();
	}

	private setupGUI()
	{
		this.menuContainer.widthInPixels = 400;
		this.menuContainer.heightInPixels = 300;
		this.menuContainer.cornerRadius = 10;
		this.menuContainer.color = "black";
		this.menuContainer.thickness = 2;
		this.menuContainer.background = "rgba(0, 0, 0, 0.8)";
		this.menuContainer.isVisible = false;
		this.advancedTexture.addControl(this.menuContainer);

		this.createMenuButton("RESUME", 0, () => this.toggleMenu());
		this.createMenuButton("SETTINGS", 1, () => this.openSettings());
		this.createMenuButton("QUIT", 2, () => this.quitGame());
		this.updateButtonStyles();
	}

	private createMenuButton(text: string, index: number, onClick: () => void)
	{
		const button = Button.CreateSimpleButton(`button_${index}`, text);
		button.widthInPixels = 200;
		button.heightInPixels = 50;
		button.color = "black";
		button.fontSize = 20;
		button.background = "transparent";
		button.topInPixels = (index - 1) * 70;
		button.onPointerClickObservable.add(onClick);
		this.menuContainer.addControl(button);
		this.buttons.push(button);
	}

	private setupKeyboardInput()
	{
		this.scene.actionManager = new ActionManager(this.scene);

		this.scene.actionManager.registerAction(new ExecuteCodeAction(
			ActionManager.OnKeyDownTrigger, 
			(evt) =>
			{
				if (evt.sourceEvent.key === 'Escape')
				{
					this.toggleMenu();
				}
			}
		));

		this.scene.onKeyboardObservable.add((kbInfo) =>
		{
			if (this.isVisible == false)
			{
				return;
			}
			if (kbInfo.type === KeyboardEventTypes.KEYDOWN)
			{
				switch (kbInfo.event.key)
				{
					case 'ArrowUp':
						this.navigateUp();
						break;
					case 'ArrowDown':
						this.navigateDown();
						break;
					case 'Enter':
						this.selectCurrentButton();
						break;
				}
			}
			this.scene.render();
		});
	}

	private navigateUp()
	{
		this.selectedIndex = (this.selectedIndex - 1 + this.buttons.length) % this.buttons.length;
		this.updateButtonStyles();
	}

	private navigateDown()
	{
		this.selectedIndex = (this.selectedIndex + 1) % this.buttons.length;
		this.updateButtonStyles();
	}

	private updateButtonStyles()
	{
		this.buttons.forEach((button, index) =>
		{
			if (index == this.selectedIndex)
			{
				button.background = "rgba(255, 255, 255, 0.3)";
				button.color = "yellow";
			}
			else
			{
				button.background = "transparent";
				button.color = "black";
			}
		});
	}

	private selectCurrentButton()
	{
		// Trigger the click event of the selected button
		console.log(`Selected: ${this.buttons[this.selectedIndex].name}`);

		this.updateButtonStyles();
		// this.buttons[this.selectedIndex].onPointerClickObservable.notifyObservers();
	}

	public toggleMenu()
	{
		this.isVisible = !this.isVisible;
		this.menuContainer.isVisible = this.isVisible;
		
		if (this.isVisible == true)
		{
			this.selectedIndex = 0;
			this.updateButtonStyles();
			if (this.game.gameRunning() == true)
			{
				this.game.toggleGamePause();
			}
			this.scene.render();
		}
		else
		{
			this.game.toggleGamePause();
		}
	}

	private openSettings()
	{
		// Implement settings menu
		console.log("Opening settings...");
	}

	private quitGame()
	{
		// Implement quit logic
		console.log("Quitting game...");
		// Maybe show confirmation dialog first
	}
}