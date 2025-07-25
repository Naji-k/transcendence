import { Paddle, Goal, Ball } from '../index';

export class Player
{
	private name:		string;
	private score:		number;
	private lives:		number;
	private goal:		Goal;
	private paddle:		Paddle;
	private arrayPosition:	number;
	public	ID:			number;

	static ballArray: Ball[] = [];
	static goalArray: Goal[] = [];
	static playerArray: Player[] = [];
	static paddleArray: Paddle[] = [];

	constructor(name: string = "Sjon", _id: number, goal: Goal, paddle: Paddle)
	{
		this.name = name;
		this.score = 0;
		this.lives = 125;
		this.ID = _id;
		this.arrayPosition = _id;
		this.goal = goal;
		this.paddle = paddle;
	}

	getName(): string
	{
		return this.name;
	}

	getScore(): number
	{
		return this.score;
	}

	incrementScore(): void
	{
		this.score++;
	}

	loseLife()
	{
		this.lives--;
	}

	isAlive(): boolean
	{
		return this.lives > 0;
	}

	decreaseArrayPosition()
	{
		this.arrayPosition--;
	}

	eliminatePlayer()
	{
		for (let i = this.arrayPosition + 1; i < Player.playerArray.length; i++)
		{
			Player.playerArray[i].decreaseArrayPosition();
		}
		Player.playerArray.splice(this.arrayPosition, 1);
		Player.goalArray.splice(this.arrayPosition, 1);
		Player.paddleArray.splice(this.arrayPosition, 1);
		this.paddle.destroy();
		this.goal.destroy();
	}
}
