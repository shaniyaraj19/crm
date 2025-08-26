// MongoDB initialization script
// This script runs when the MongoDB container starts for the first time

db = db.getSiblingDB('v-accel-crm');

// Create collections with validation
db.createCollection('users', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['firstName', 'lastName', 'email', 'role', 'organizationId'],
      properties: {
        firstName: { bsonType: 'string' },
        lastName: { bsonType: 'string' },
        email: { bsonType: 'string' },
        role: { enum: ['admin', 'manager', 'sales_rep'] },
        isActive: { bsonType: 'bool' },
        isEmailVerified: { bsonType: 'bool' }
      }
    }
  }
});

db.createCollection('pipelines', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['name', 'organizationId', 'stages'],
      properties: {
        name: { bsonType: 'string' },
        isDefault: { bsonType: 'bool' },
        isActive: { bsonType: 'bool' },
        stages: {
          bsonType: 'array',
          minItems: 2,
          items: {
            bsonType: 'object',
            required: ['name', 'probability', 'color', 'order'],
            properties: {
              name: { bsonType: 'string' },
              probability: { bsonType: 'number', minimum: 0, maximum: 100 },
              color: { bsonType: 'string' },
              order: { bsonType: 'number', minimum: 0 }
            }
          }
        }
      }
    }
  }
});

db.createCollection('deals', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['title', 'value', 'pipelineId', 'stageId', 'organizationId'],
      properties: {
        title: { bsonType: 'string' },
        value: { bsonType: 'number', minimum: 0 },
        currency: { bsonType: 'string' },
        priority: { enum: ['low', 'medium', 'high', 'urgent'] },
        status: { enum: ['open', 'won', 'lost', 'pending'] },
        probability: { bsonType: 'number', minimum: 0, maximum: 100 }
      }
    }
  }
});

db.createCollection('contacts', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['firstName', 'lastName', 'organizationId'],
      properties: {
        firstName: { bsonType: 'string' },
        lastName: { bsonType: 'string' },
        email: { bsonType: 'string' },
        type: { enum: ['lead', 'prospect', 'customer', 'partner'] },
        leadScore: { bsonType: 'number', minimum: 0, maximum: 100 }
      }
    }
  }
});

db.createCollection('companies', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['name', 'organizationId'],
      properties: {
        name: { bsonType: 'string' },
        employeeCount: { bsonType: 'number', minimum: 0 },
        annualRevenue: { bsonType: 'number', minimum: 0 },
        status: { enum: ['Active', 'Inactive', 'Prospect', 'Customer', 'Partner'] },
        lifecycle: { enum: ['Lead', 'Prospect', 'Customer', 'Partner', 'Former Customer'] }
      }
    }
  }
});

db.createCollection('activities', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['title', 'type', 'assignedTo', 'organizationId'],
      properties: {
        title: { bsonType: 'string' },
        type: { enum: ['task', 'call', 'meeting', 'email', 'note'] },
        status: { enum: ['pending', 'in_progress', 'completed', 'cancelled', 'overdue'] },
        priority: { enum: ['low', 'medium', 'high', 'urgent'] },
        duration: { bsonType: 'number', minimum: 0 }
      }
    }
  }
});

// Create indexes for better performance
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ organizationId: 1 });
db.users.createIndex({ role: 1 });

db.pipelines.createIndex({ organizationId: 1 });
db.pipelines.createIndex({ organizationId: 1, isDefault: 1 });

db.deals.createIndex({ organizationId: 1 });
db.deals.createIndex({ pipelineId: 1 });
db.deals.createIndex({ assignedTo: 1 });
db.deals.createIndex({ contactId: 1 });
db.deals.createIndex({ companyId: 1 });

db.contacts.createIndex({ organizationId: 1 });
db.contacts.createIndex({ email: 1 });
db.contacts.createIndex({ companyId: 1 });

db.companies.createIndex({ organizationId: 1 });
db.companies.createIndex({ name: 1 });

db.activities.createIndex({ organizationId: 1 });
db.activities.createIndex({ assignedTo: 1 });
db.activities.createIndex({ dueDate: 1 });
db.activities.createIndex({ dealId: 1 });

print('Database initialized successfully!');