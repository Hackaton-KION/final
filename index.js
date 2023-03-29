import * as dotenv from 'dotenv'; // хранение секретной фразы и конфиг
import express, { json } from 'express';
import { Sequelize, DataTypes } from 'sequelize'; //обеспечение работы с БД (подкл., запросы и т.д.)

import cors from 'cors'; // политика безопасности накидывает хедеры для обеспечения нормальной работы сервера
import fileUpload from 'express-fileupload'; // загрузка файлов на сервер

import films from './api/films';
import presets from './api/presets';
import users from './api/users';

import { hash } from 'bcrypt'; // для того, чтобы сверять пароли по хешу

dotenv.config();
// Connect to database
export const sequelize = new Sequelize(
	process.env.DB_NAME,
	process.env.DB_USER,
	process.env.DB_PASSWORD,
	{
		host: process.env.DB_HOST,
		port: process.env.DB_PORT,
		dialect: 'postgres',
	}
);

function createTableUsers() {
	const Users = sequelize.define(
		'Users',
		{
			// Model attributes are defined here
			login: {
				type: DataTypes.STRING,
				allowNull: false,
				// unique: { name: 'uniqueLogin', msg: 'Login must be unique' },
				unique: true,
			},
			password: {
				type: DataTypes.STRING,
				allowNull: false,
			},
		},
		{
			// Other model options go here
			timestamps: false,
		}
	);
}
function createTableFilms() {
	const Films = sequelize.define(
		'Films',
		{
			// Model attributes are defined here
			title: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			description: {
				type: DataTypes.STRING,
				allowNull: true,
			},
			dateReleaseVideo: {
				type: DataTypes.DATEONLY,
				allowNull: false,
			},
			urlPreview: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			urlVideo: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			urlPreprocessedVideo: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			manifestURL: {
				type: DataTypes.STRING,
				allowNull: false,
			},
		},
		{
			// Other model options go here
			timestamps: false,
		}
	);
}
function createTablePresets() {
	const colorValidateOptions = {
		min: 0,
		max: 256,
	};
	const Presets = sequelize.define(
		'Presets',
		{
			userId: {
				type: DataTypes.INTEGER,
				allowNull: true,
				references: {
					model: sequelize.models.Users,
					key: 'id',
				},
			},
			name: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			brightness: {
				type: DataTypes.INTEGER,
				allowNull: false,
			},
			contrast: {
				type: DataTypes.INTEGER,
				allowNull: false,
			},
			saturation: {
				type: DataTypes.INTEGER,
				allowNull: false,
			},
			sharpness: {
				type: DataTypes.INTEGER,
				allowNull: false,
			},
			offEpilepticScene: {
				type: DataTypes.BOOLEAN,
				allowNull: false,
			},
			enableCustomGamma: {
				type: DataTypes.BOOLEAN,
				allowNull: false,
			},
			red: {
				type: DataTypes.INTEGER,
				allowNull: false,
				validate: colorValidateOptions,
				defaultValue: 255,
			},
			green: {
				type: DataTypes.INTEGER,
				allowNull: false,
				validate: colorValidateOptions,
				defaultValue: 255,
			},
			blue: {
				type: DataTypes.INTEGER,
				allowNull: false,
				validate: colorValidateOptions,
				defaultValue: 255,
			},
			isStandard: {
				type: DataTypes.BOOLEAN,
				allowNull: false,
				defaultValue: false,
			},
		},
		{
			// Other model options go here
			timestamps: false,
		}
	);

}

async function createTables() {
	createTableUsers();
	createTableFilms();
	createTablePresets();
	await sequelize.sync();


	await sequelize.models.Presets.create({
		userId: null,
		name: 'Обычный',
		brightness: 100,
		contrast: 100,
		saturation: 1,
		sharpness: 100,
		offEpilepticScene: false,
		enableCustomGamma: false,
		red: 255,
		green: 255,
		blue: 255,
		isStandard: true,
	});
	await sequelize.models.Presets.create({
		userId: null,
		name: 'Без красного',
		brightness: 100,
		contrast: 100,
		saturation: 1,
		sharpness: 100,
		offEpilepticScene: false,
		enableCustomGamma: false,
		red: 0,
		green: 255,
		blue: 255,
		isStandard: true,
	});
  await sequelize.models.Presets.create({
		userId: null,
		name: 'Без зеленого',
		brightness: 100,
		contrast: 100,
		saturation: 1,
		sharpness: 100,
		offEpilepticScene: false,
		enableCustomGamma: false,
		red: 255,
		green: 0,
		blue: 255,
		isStandard: true,
	});
  await sequelize.models.Presets.create({
		userId: null,
		name: 'Без синего',
		brightness: 100,
		contrast: 100,
		saturation: 1,
		sharpness: 100,
		offEpilepticScene: false,
		enableCustomGamma: false,
		red: 255,
		green: 255,
		blue: 0,
		isStandard: true,
	});

//создание пользователей
	await sequelize.models.Users.create({
		login: 'login1',
		password: await hash("1234", 4)
	});

	await sequelize.models.Users.create({
		login: 'login2',
		password: await hash("1234", 4)
	});
	
	await sequelize.models.Users.create({
		login: 'login3',
		password: await hash("1234", 4)
	});
}

const app = express();

app.use(fileUpload());
app.use(json());
app.use(
	cors({
		origin: (origin, callback) => {
			return callback(null, true);
		},
		credentials: true,
	})
);
app.use('/static', express.static('assets'));
app.use('/api/films', films);
app.use('/api/presets', presets);
app.use('/api/users', users);

//api
app.get('/api/ping', (req, res) => {
	res.json('pong');
});

app.listen(5000, async () => {
	try {
		await sequelize.authenticate();
		console.log('Connection has been established successfully.');
		await createTables();
	} catch (error) {
		console.error('Unable to connect to the database:', error);
	}
});
