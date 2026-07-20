# Backend Specification

## Overview

Backend is implemented as a REST API using NestJS.

Architecture principles:

- REST
- Modular architecture
- Feature-first structure
- Dependency Injection
- DTO validation
- Repository pattern
- JWT authentication
- Swagger documentation

---

# Tech Stack

Framework

- NestJS 11
- TypeScript

Database

- PostgreSQL
- TypeORM

Authentication

- JWT Access Token
- JWT Refresh Token
- bcrypt

Validation

- class-validator
- class-transformer

Documentation

- Swagger

Storage

- Local filesystem (development)
- S3-compatible storage (production)

---

# Project Structure

src/

auth/

users/

destinations/

locations/

tours/

trips/

bookings/

extra-services/

files/

admin/

common/

config/

database/

---

Each module contains

controller

service

repository

entity

dto

interfaces

enums

---

# Authentication

Authentication uses JWT.

User logs in using

Email

Password

Server returns

AccessToken

RefreshToken

AccessToken is sent in

Authorization: Bearer <token>

RefreshToken is stored in database.

---

# Roles

Two roles exist.

USER

ADMIN

USER

Can

- browse catalog
- create Trips
- edit Trips
- create Booking
- edit profile

Cannot

- modify catalog

ADMIN

Can

- create destinations
- create locations
- create tours
- create services
- publish tours
- manage bookings
- manage users

---

# Controllers

Controllers contain

- routing
- request validation
- calling services

Controllers never contain business logic.

---

# Services

Services contain

- business logic
- validation
- calculations
- permissions

---

# Repository Layer

Repositories contain only

database access

No business logic.

---

# DTO

Every endpoint uses DTO.

Validation is mandatory.

Example

CreateTourDto

UpdateTourDto

CreateTripDto

CreateBookingDto

---

# Error Handling

Use NestJS exceptions.

Examples

BadRequestException

UnauthorizedException

ForbiddenException

NotFoundException

ConflictException

InternalServerErrorException

Never return plain strings.

---

# Pagination

All collection endpoints support

page

limit

sort

order

Example

GET /tours?page=1&limit=20

---

# Filtering

Catalog endpoints support filtering.

Possible filters

destination

difficulty

duration

price

season

search text

---

# Trips

Trip is a personal editable itinerary.

Every Trip belongs to exactly one User.

Trips are private.

A user cannot access another user's Trips.

Trip may be

created empty

or

created from Tour.

---

# Booking

Booking is immutable.

Booking is created only after successful prepayment.

Booking stores snapshot of Trip.

Changing Trip never changes Booking.

---

# Images

Images belong to

Destination

Location

Tour

Files are stored separately.

Database stores only metadata.

---

# Validation

Use class-validator.

Validate

UUID

Email

Dates

Enums

Lengths

Numbers

Arrays

---

# Transactions

Use database transactions when

creating Booking

duplicating Trip

creating Tour

bulk updates

---

# Logging

Use NestJS Logger.

Log

unexpected exceptions

authentication events

critical operations

---

# Swagger

Every endpoint contains

Summary

Description

Request DTO

Response DTO

Status codes

Example request

Example response

---

# Security

Passwords are hashed using bcrypt.

Secrets are stored in .env.

Never expose

password

refresh token

internal ids

---

# Naming

Controllers

ToursController

TripsController

Services

ToursService

TripsService

Repositories

ToursRepository

Entities

Tour

Trip

Booking

DTO

CreateTripDto

UpdateTripDto

Response DTO

TripResponseDto

BookingResponseDto

---

# REST Conventions

GET

Returns resource.

POST

Creates resource.

PATCH

Updates resource.

DELETE

Deletes resource.

Plural nouns are used.

Correct

GET /tours

Wrong

GET /tour

---

# UUID

All entities use UUID.

Never expose incremental IDs.

---

# Soft Delete

Soft delete is enabled for

Trip

Tour

Location

Destination

ExtraService

User

Booking cannot be deleted.

Only cancelled.

---

# Code Style

Business logic only in services.

Database access only in repositories.

Controllers stay thin.

DTO contains validation only.

No duplicated logic.

Prefer composition over inheritance.

Prefer explicit naming.

Avoid magic values.

Write readable code.