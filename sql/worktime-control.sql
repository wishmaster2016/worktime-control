/*
Navicat PGSQL Data Transfer

Source Server         : test1
Source Server Version : 90305
Source Host           : localhost:5432
Source Database       : worktime-control
Source Schema         : public

Target Server Type    : PGSQL
Target Server Version : 90305
File Encoding         : 65001

Date: 2014-12-18 05:11:11
*/


-- ----------------------------
-- Sequence structure for "table_time_id_seq"
-- ----------------------------
DROP SEQUENCE "table_time_id_seq";
CREATE SEQUENCE "table_time_id_seq"
 INCREMENT 1
 MINVALUE 1
 MAXVALUE 9223372036854775807
 START 1
 CACHE 1;

-- ----------------------------
-- Sequence structure for "users_id_seq"
-- ----------------------------
DROP SEQUENCE "users_id_seq";
CREATE SEQUENCE "users_id_seq"
 INCREMENT 1
 MINVALUE 1
 MAXVALUE 9223372036854775807
 START 1
 CACHE 1;

-- ----------------------------
-- Sequence structure for "workers_id_seq"
-- ----------------------------
DROP SEQUENCE "workers_id_seq";
CREATE SEQUENCE "workers_id_seq"
 INCREMENT 1
 MINVALUE 1
 MAXVALUE 9223372036854775807
 START 1
 CACHE 1;

-- ----------------------------
-- Table structure for "table_time"
-- ----------------------------
DROP TABLE "table_time";
CREATE TABLE "table_time" (
"id" int4 DEFAULT nextval('table_time_id_seq'::regclass) NOT NULL,
"name" varchar(255),
"day" timestamp(6),
"work_start" timestamp(6),
"work_end" timestamp(6)
)
WITH (OIDS=FALSE)

;

-- ----------------------------
-- Records of table_time
-- ----------------------------
BEGIN;
COMMIT;

-- ----------------------------
-- Table structure for "users"
-- ----------------------------
DROP TABLE "users";
CREATE TABLE "users" (
"id" int4 DEFAULT nextval('users_id_seq'::regclass) NOT NULL,
"login" varchar(255),
"password" varchar(255)
)
WITH (OIDS=FALSE)

;

-- ----------------------------
-- Records of users
-- ----------------------------
BEGIN;
INSERT INTO "users" VALUES ('1', '111', '111');
INSERT INTO "users" VALUES ('3', '333', '333');
INSERT INTO "users" VALUES ('4', '444', '444');
INSERT INTO "users" VALUES ('7', '7', '7');
COMMIT;

-- ----------------------------
-- Table structure for "workers"
-- ----------------------------
DROP TABLE "workers";
CREATE TABLE "workers" (
"id" int4 DEFAULT nextval('workers_id_seq'::regclass) NOT NULL,
"name" varchar(255),
"gender" varchar(255),
"contact_inf" varchar(255),
"date_added" timestamp(6)
)
WITH (OIDS=FALSE)

;

-- ----------------------------
-- Records of workers
-- ----------------------------
BEGIN;
INSERT INTO "workers" VALUES ('1', 'Ivanov Ivan', 'male', 'tra-ta-ta', '2004-10-19 10:23:54');
INSERT INTO "workers" VALUES ('2', 'asdfasdf', 'sdfsd', 'sdfsdfsd', '2004-10-19 10:23:54');
INSERT INTO "workers" VALUES ('3', 'erewrq', 'erewq', 'rwerw', '2004-10-19 10:23:54');
INSERT INTO "workers" VALUES ('4', 'werwer', 'werwer', 'werwer', '2004-10-19 10:23:54');
INSERT INTO "workers" VALUES ('5', 'erew', 'erwe', 'ewrwer', '2004-10-19 10:23:54');
INSERT INTO "workers" VALUES ('6', 'rwerwe', 'ewrwer', 'werwer', '2004-10-19 10:23:54');
INSERT INTO "workers" VALUES ('7', 'ewrwer', 'rwer', 'werwe', '2004-10-19 10:23:54');
COMMIT;

-- ----------------------------
-- Alter Sequences Owned By 
-- ----------------------------
ALTER SEQUENCE "table_time_id_seq" OWNED BY "table_time"."id";
ALTER SEQUENCE "users_id_seq" OWNED BY "users"."id";
ALTER SEQUENCE "workers_id_seq" OWNED BY "workers"."id";

-- ----------------------------
-- Primary Key structure for table "table_time"
-- ----------------------------
ALTER TABLE "table_time" ADD PRIMARY KEY ("id");

-- ----------------------------
-- Primary Key structure for table "users"
-- ----------------------------
ALTER TABLE "users" ADD PRIMARY KEY ("id");

-- ----------------------------
-- Primary Key structure for table "workers"
-- ----------------------------
ALTER TABLE "workers" ADD PRIMARY KEY ("id");
