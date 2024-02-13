require("dotenv").config();
const express = require("express");
const app = express();
const morgan = require("morgan");
const cors = require("cors");
app.use(express.json());
app.use(cors());
app.use(express.static("dist"));
const Person = require("./models/person");
morgan.token("body", (req, res) => {
  return JSON.stringify(req.body);
});
app.use(
  morgan(":method :url :status :res[content-length] - :response-time ms :body")
);

const info = () => `<p>Phonebook has info for ${persons.length} people</p>
<p>${Date()}</p>
`;

app.get("/info", (request, response) => {
  response.send(info());
});

app.get("/api/persons", (request, response) => {
  Person.find({}).then((persons) => {
    response.json(persons);
  });
});

app.get("/api/persons/:id", (request, response, next) => {
  Person.findById(request.params.id)
    .then((person) => {
      response.json(person);
    })
    .catch((error) => {
      next(error);
    });
});

app.delete("/api/persons/:id", (request, response, next) => {
  Person.findByIdAndDelete(request.params.id)
    .then((result) => {
      if (!result) {
        response.status(404).end();
      } else {
        response.status(204).end();
      }
    })
    .catch((error) => {
      next(error);
    });
});

app.post("/api/persons", (request, response) => {
  const person = request.body;
  if (!person.name) {
    return response.status(400).json({
      error: "name is missing",
    });
  } else if (!person.number) {
    return response.status(400).json({
      error: "number is missing",
    });
  }
  const personObject = new Person({
    name: person.name,
    number: person.number,
  });
  personObject.save().then((savedPerson) => {
    response.json(savedPerson);
  });
});

app.put("/api/persons/:id", (request, response, next) => {
  const body = request.body;
  const personObject = {
    name: body.name,
    number: body.number,
  };
  Person.findByIdAndUpdate(request.params.id, personObject, { new: true })
    .then((updatedPerson) => {
      response.json(updatedPerson);
    })
    .catch((error) => next(error));
});

const errorHandler = (error, request, response, next) => {
  console.error(error.message);

  if (error.name === "CastError") {
    return response.status(400).send({ error: "malformatted id" });
  }
  next(error);
};

app.use(errorHandler);

const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
