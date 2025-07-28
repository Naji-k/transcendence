import { Paddle, Goal, Ball, Wall } from '../index';

export class Player
{
	private name:		string;
	private score:		number;
	private lives:		number;
	private goal:		Goal;
	private paddle:		Paddle;
	private arrayPosition:	number;
	private controlKeys:	[string, string] = ["", ""];
	public	ID:			number;

	static ballArray: Ball[] = [];
	static wallArray: Wall[] = [];
	static goalArray: Goal[] = [];
	static playerArray: Player[] = [];
	static paddleArray: Paddle[] = [];
	static playerCount: number = 0;

	static playerColors: string[] =
	[
		"Red",
		"Blue",
		"Yellow",
		"Green",
		"Magenta",
		"Cyan"
	];

	constructor(name: string = "Sjon", _id: number, goal: Goal, paddle: Paddle)
	{
		this.name = name;
		this.score = 0;
		this.lives = 1;
		this.ID = _id;
		this.arrayPosition = _id;
		this.goal = goal;
		this.paddle = paddle;
	}

	checkForActions(keys: Record<string, boolean>)
	{
		const keyDownIsPressed = keys[this.controlKeys[0]];
		const keyUpIsPressed = keys[this.controlKeys[1]];

		if (keyUpIsPressed == true || keyDownIsPressed == true)
		{
			if (keyUpIsPressed == true)
			{
				this.paddle.update(1, true);
			}
			if (keyDownIsPressed == true)
			{
				this.paddle.update(-1, true);
			}
		}
		else
		{
			this.paddle.update(0, false);
		}
	}

	getName(): string
	{
		return this.name;
	}

	getLives(): number
	{
		return this.lives;
	}

	incrementScore(): void
	{
		this.score++;
	}

	loseLife()
	{
		this.lives--;
		if (this.lives <= 0)
		{
			this.eliminate();
		}
	}

	decreaseArrayPosition()
	{
		this.arrayPosition--;
	}

	setControls(keyUp: string, keyDown: string)
	{
		this.controlKeys[0] = keyUp;
		this.controlKeys[1] = keyDown;
	}

	isAlive(): boolean
	{
		return this.lives > 0;
	}

	private eliminate()
	{
		// for (let i = this.arrayPosition + 1; i < Player.playerArray.length; i++)
		// {
		// 	Player.playerArray[i].decreaseArrayPosition();
		// }
		// Player.playerArray.splice(this.arrayPosition, 1);
		this.paddle.eliminate();
		this.goal.eliminate();
		Player.playerCount--;
	}
}
