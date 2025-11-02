import { Paddle } from './paddle';
import { Goal } from './goal';

export class Player
{
	private name:		string;
	private lives:		number;
	private goal:		Goal;
	private paddle:		Paddle;
	public	ID:			number;

	constructor(name: string, _id: number, goal: Goal, paddle: Paddle)
	{
		this.name = name;
		this.lives = 3;
		this.ID = _id;
		this.goal = goal;
		this.paddle = paddle;
	}

	getName(): string
	{
		return this.name;
	}

	getLives(): number
	{
		return this.lives;
	}

	setLives(lives: number)
	{
		this.lives = lives;
		if (this.lives <= 0)
		{
			this.eliminate();
		}
	}

	isAlive(): boolean
	{
		return this.lives > 0;
	}

	setName(name: string)
	{
		this.name = name;
	}

	private eliminate()
	{
		this.paddle.eliminate();
		this.goal.eliminate();
	}

	updatePlayer(id: number, name: string, lives: number)
	{
		this.ID = id;
		this.name = name;
		this.lives = lives;
	}
}
