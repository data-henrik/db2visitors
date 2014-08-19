create table ip.visitors(
	id int unique not null generated always as identity,
	vtime  timestamp,
	ip varchar(30),
	country_code varchar(10),
	country varchar(50),
	region_code varchar(10),
	region varchar(50),
	city varchar(100),
	zip varchar(20),
	latitude varchar(30),
	longitude varchar(30),
	metro varchar(20),
	area varchar(20)
);
