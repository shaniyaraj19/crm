import { connect, disconnect } from 'mongoose';
import { User } from '../src/models/User';
import { Pipeline } from '../src/models/Pipeline';
import { Company } from '../src/models/Company';
import { Contact } from '../src/models/Contact';
import { Deal } from '../src/models/Deal';
import { Activity } from '../src/models/Activity';
import { UserRole, ContactType, DealPriority, DealStatus, ActivityType, ActivityStatus, Permission } from '../src/types/common';
import { env } from '../src/config/environment';

// Realistic sample data
const ORGANIZATIONS = [
  { name: 'TechCorp Solutions', domain: 'techcorp.com', industry: 'Technology' },
  { name: 'Global Dynamics', domain: 'globaldynamics.com', industry: 'Manufacturing' },
  { name: 'Innovation Labs', domain: 'innovationlabs.io', industry: 'Software' }
];

const COMPANIES_DATA = [
  { name: 'Microsoft Corporation', domain: 'microsoft.com', industry: 'Technology', employees: 181000, revenue: 198000000000 },
  { name: 'Apple Inc.', domain: 'apple.com', industry: 'Technology', employees: 154000, revenue: 394328000000 },
  { name: 'Google LLC', domain: 'google.com', industry: 'Technology', employees: 139995, revenue: 282836000000 },
  { name: 'Amazon.com Inc.', domain: 'amazon.com', industry: 'E-commerce', employees: 1541000, revenue: 513983000000 },
  { name: 'Tesla Inc.', domain: 'tesla.com', industry: 'Automotive', employees: 99290, revenue: 81462000000 },
  { name: 'Meta Platforms Inc.', domain: 'meta.com', industry: 'Technology', employees: 67317, revenue: 117929000000 },
  { name: 'Netflix Inc.', domain: 'netflix.com', industry: 'Entertainment', employees: 12800, revenue: 31616000000 },
  { name: 'Salesforce Inc.', domain: 'salesforce.com', industry: 'Software', employees: 73541, revenue: 31352000000 },
  { name: 'Adobe Inc.', domain: 'adobe.com', industry: 'Software', employees: 26788, revenue: 17606000000 },
  { name: 'Oracle Corporation', domain: 'oracle.com', industry: 'Software', employees: 143000, revenue: 49954000000 },
  { name: 'IBM Corporation', domain: 'ibm.com', industry: 'Technology', employees: 282100, revenue: 60470000000 },
  { name: 'Intel Corporation', domain: 'intel.com', industry: 'Semiconductors', employees: 121100, revenue: 79024000000 },
  { name: 'Cisco Systems Inc.', domain: 'cisco.com', industry: 'Networking', employees: 84900, revenue: 51557000000 },
  { name: 'PayPal Holdings Inc.', domain: 'paypal.com', industry: 'Financial Services', employees: 30900, revenue: 25371000000 },
  { name: 'Shopify Inc.', domain: 'shopify.com', industry: 'E-commerce', employees: 11600, revenue: 5610000000 }
];

const FIRST_NAMES = ['John', 'Jane', 'Michael', 'Sarah', 'David', 'Lisa', 'Robert', 'Emily', 'James', 'Jennifer', 'William', 'Amanda', 'Christopher', 'Jessica', 'Daniel'];
const LAST_NAMES = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson'];
const JOB_TITLES = ['CEO', 'CTO', 'VP of Sales', 'Director of Marketing', 'Head of Operations', 'Senior Developer', 'Product Manager', 'Sales Manager', 'Marketing Specialist', 'Account Executive'];

class DatabaseSeeder {
  private organizationIds: string[] = [];
  private userIds: string[] = [];
  private pipelineIds: string[] = [];
  private companyIds: string[] = [];
  private contactIds: string[] = [];
  private dealIds: string[] = [];

  async connect() {
    try {
      await connect(env.MONGODB_URI);
      console.log('✅ Connected to MongoDB');
    } catch (error) {
      console.error('❌ Database connection failed:', error);
      process.exit(1);
    }
  }

  async disconnect() {
    await disconnect();
    console.log('✅ Disconnected from MongoDB');
  }

  async clearCollections() {
    console.log('🗑️  Clearing existing data...');
    await Promise.all([
      User.deleteMany({}),
      Pipeline.deleteMany({}),
      Company.deleteMany({}),
      Contact.deleteMany({}),
      Deal.deleteMany({}),
      Activity.deleteMany({})
    ]);
    console.log('✅ Collections cleared');
  }

  async seedUsers() {
    console.log('👥 Seeding users...');
    const users = [];

    // Create admin user for each organization
    for (let i = 0; i < ORGANIZATIONS.length; i++) {
      const org = ORGANIZATIONS[i];
      
      const adminUser = await User.create({
        firstName: 'Admin',
        lastName: 'User',
        email: `admin@${org.domain}`,
        password: 'admin123', // Let the User model hash this automatically
        role: UserRole.ADMIN,
        permissions: [Permission.USER_READ, Permission.USER_CREATE, Permission.USER_UPDATE, Permission.USER_DELETE, Permission.DEAL_READ, Permission.DEAL_CREATE, Permission.CONTACT_READ, Permission.CONTACT_CREATE],
        isEmailVerified: true,
        organization: {
          name: org.name,
          domain: org.domain,
          industry: org.industry
        }
      });
      
      // Update admin user to set organizationId to its own _id
      adminUser.organizationId = adminUser._id.toString();
      await adminUser.save();
      
      users.push(adminUser);
      this.userIds.push(adminUser._id.toString());
      this.organizationIds.push(adminUser._id.toString()); // Using user ID as org ID for simplicity

      // Create managers
      for (let j = 0; j < 2; j++) {
        const managerUser = await User.create({
          firstName: FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)],
          lastName: LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)],
          email: `manager${j + 1}@${org.domain}`,
          password: 'admin123', // Let the User model hash this automatically
          role: UserRole.MANAGER,
          permissions: [Permission.DEAL_READ, Permission.DEAL_CREATE, Permission.DEAL_UPDATE, Permission.CONTACT_READ, Permission.CONTACT_CREATE],
          isEmailVerified: true,
          organizationId: adminUser._id.toString(),
          organization: {
            name: org.name,
            domain: org.domain,
            industry: org.industry
          }
        });
        
        users.push(managerUser);
        this.userIds.push(managerUser._id.toString());
      }

      // Create sales reps
      for (let k = 0; k < 3; k++) {
        const salesUser = await User.create({
          firstName: FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)],
          lastName: LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)],
          email: `sales${k + 1}@${org.domain}`,
          password: 'admin123', // Let the User model hash this automatically
          role: UserRole.SALES_REP,
          permissions: [Permission.DEAL_READ, Permission.DEAL_CREATE, Permission.CONTACT_READ, Permission.CONTACT_CREATE],
          isEmailVerified: true,
          organizationId: adminUser._id.toString(),
          organization: {
            name: org.name,
            domain: org.domain,
            industry: org.industry
          }
        });
        
        users.push(salesUser);
        this.userIds.push(salesUser._id.toString());
      }
    }

    console.log(`✅ Created ${users.length} users`);
    return users;
  }

  async seedPipelines() {
    console.log('🔄 Seeding pipelines...');
    const pipelines = [];

    for (let i = 0; i < this.organizationIds.length; i++) {
      const orgId = this.organizationIds[i];

      // Sales Pipeline
      const salesPipeline = await Pipeline.create({
        name: 'Sales Pipeline',
        description: 'Main sales process pipeline',
        organizationId: orgId,
        stages: [
          { name: 'Lead', order: 1, probability: 10, color: '#f87171' },
          { name: 'Qualified', order: 2, probability: 25, color: '#fb923c' },
          { name: 'Proposal', order: 3, probability: 50, color: '#fbbf24' },
          { name: 'Negotiation', order: 4, probability: 75, color: '#34d399' },
          { name: 'Closed Won', order: 5, probability: 100, color: '#10b981' },
          { name: 'Closed Lost', order: 6, probability: 0, color: '#ef4444' }
        ],
        isActive: true,
        createdBy: orgId
      });

      pipelines.push(salesPipeline);
      this.pipelineIds.push(salesPipeline._id.toString());

      // Customer Success Pipeline
      const successPipeline = await Pipeline.create({
        name: 'Customer Success',
        description: 'Post-sale customer success pipeline',
        organizationId: orgId,
        stages: [
          { name: 'Onboarding', order: 1, probability: 20, color: '#8b5cf6' },
          { name: 'Implementation', order: 2, probability: 50, color: '#a78bfa' },
          { name: 'Go-Live', order: 3, probability: 80, color: '#c4b5fd' },
          { name: 'Success', order: 4, probability: 100, color: '#10b981' }
        ],
        isActive: true,
        createdBy: orgId
      });

      pipelines.push(successPipeline);
      this.pipelineIds.push(successPipeline._id.toString());
    }

    console.log(`✅ Created ${pipelines.length} pipelines`);
    return pipelines;
  }

  async seedCompanies() {
    console.log('🏢 Seeding companies...');
    const companies = [];

    for (let i = 0; i < COMPANIES_DATA.length; i++) {
      const companyData = COMPANIES_DATA[i];
      const orgId = this.organizationIds[i % this.organizationIds.length];

      const company = await Company.create({
        name: companyData.name,
        domain: companyData.domain,
        industry: companyData.industry,
        employeeCount: companyData.employees,
        annualRevenue: companyData.revenue,
        description: `${companyData.name} is a leading company in the ${companyData.industry} industry.`,
        organizationId: orgId,
        createdBy: orgId,
        tags: [companyData.industry, 'Enterprise', 'High-Value'],
        socialMedia: {
          linkedin: `https://linkedin.com/company/${companyData.domain.split('.')[0]}`,
          twitter: `https://twitter.com/${companyData.domain.split('.')[0]}`
        }
      });

      companies.push(company);
      this.companyIds.push(company._id.toString());
    }

    console.log(`✅ Created ${companies.length} companies`);
    return companies;
  }

  async seedContacts() {
    console.log('👤 Seeding contacts...');
    const contacts = [];

    // Create 2-4 contacts per company
    for (let i = 0; i < this.companyIds.length; i++) {
      const companyId = this.companyIds[i];
      const orgId = this.organizationIds[i % this.organizationIds.length];
      const contactCount = Math.floor(Math.random() * 3) + 2;

      for (let j = 0; j < contactCount; j++) {
        const firstName = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
        const lastName = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
        const companyDomain = COMPANIES_DATA[i].domain;

        const contact = await Contact.create({
          firstName,
          lastName,
          email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${companyDomain}`,
          phone: `+1${Math.floor(Math.random() * 9000000000) + 1000000000}`,
          mobile: `+1${Math.floor(Math.random() * 9000000000) + 1000000000}`,
          jobTitle: JOB_TITLES[Math.floor(Math.random() * JOB_TITLES.length)],
          department: ['Sales', 'Marketing', 'Engineering', 'Operations', 'Finance'][Math.floor(Math.random() * 5)],
          type: j === 0 ? ContactType.CUSTOMER : [ContactType.LEAD, ContactType.PROSPECT, ContactType.CUSTOMER][Math.floor(Math.random() * 3)],
          companyId,
          organizationId: orgId,
          createdBy: orgId,
          tags: ['Imported', 'Active'],
          socialMedia: {
            linkedin: `https://linkedin.com/in/${firstName.toLowerCase()}-${lastName.toLowerCase()}`
          }
        });

        contacts.push(contact);
        this.contactIds.push(contact._id.toString());
      }
    }

    console.log(`✅ Created ${contacts.length} contacts`);
    return contacts;
  }

  async seedDeals() {
    console.log('💰 Seeding deals...');
    const deals = [];

    // Create deals for random contacts
    const dealCount = Math.floor(this.contactIds.length * 0.7); // 70% of contacts have deals

    for (let i = 0; i < dealCount; i++) {
      const contactId = this.contactIds[Math.floor(Math.random() * this.contactIds.length)];
      const pipelineId = this.pipelineIds[Math.floor(Math.random() * this.pipelineIds.length)];
      const orgId = this.organizationIds[Math.floor(Math.random() * this.organizationIds.length)];
      const userId = this.userIds[Math.floor(Math.random() * this.userIds.length)];

      // Get company from contact
      const contact = await Contact.findById(contactId);
      const companyId = contact?.companyId;

      const dealValue = Math.floor(Math.random() * 1000000) + 10000;
      const pipeline = await Pipeline.findById(pipelineId);
      const stages = pipeline?.stages || [];
      const randomStage = stages[Math.floor(Math.random() * (stages.length - 1))]; // Exclude closed lost

      const deal = await Deal.create({
        title: `${COMPANIES_DATA[i % COMPANIES_DATA.length].name} - ${['Software License', 'Consulting Services', 'Enterprise Solution', 'Support Contract'][Math.floor(Math.random() * 4)]}`,
        description: 'Strategic partnership opportunity with significant growth potential',
        value: dealValue,
        currency: 'USD',
        priority: [DealPriority.LOW, DealPriority.MEDIUM, DealPriority.HIGH, DealPriority.URGENT][Math.floor(Math.random() * 4)],
        status: randomStage?.name === 'Closed Won' ? DealStatus.WON : 
                randomStage?.name === 'Closed Lost' ? DealStatus.LOST : DealStatus.OPEN,
        probability: randomStage?.probability || 25,
        expectedCloseDate: new Date(Date.now() + Math.floor(Math.random() * 90) * 24 * 60 * 60 * 1000),
        pipelineId,
        stageId: randomStage?._id?.toString(),
        contactId,
        companyId,
        assignedTo: userId,
        organizationId: orgId,
        createdBy: orgId,
        tags: ['Q4 2024', 'Enterprise', 'High Priority'],
        customFields: {
          'Lead Source': ['Website', 'Referral', 'Cold Call', 'Social Media'][Math.floor(Math.random() * 4)],
          'Product Interest': ['CRM', 'Analytics', 'Integration', 'Support'][Math.floor(Math.random() * 4)]
        },
        notes: [{
          content: 'Initial discovery call completed. Strong interest in our enterprise solution.',
          createdBy: userId,
          createdAt: new Date()
        }]
      });

      deals.push(deal);
      this.dealIds.push(deal._id.toString());
    }

    console.log(`✅ Created ${deals.length} deals`);
    return deals;
  }

  async seedActivities() {
    console.log('📅 Seeding activities...');
    const activities = [];

    // Create activities for deals and contacts
    for (let i = 0; i < this.dealIds.length; i++) {
      const dealId = this.dealIds[i];
      const contactId = this.contactIds[i % this.contactIds.length];
      const orgId = this.organizationIds[i % this.organizationIds.length];
      const userId = this.userIds[i % this.userIds.length];

      // Past activity (completed)
      const pastActivity = await Activity.create({
        title: 'Discovery Call',
        description: 'Initial discovery call to understand requirements and budget',
        type: ActivityType.CALL,
        status: ActivityStatus.COMPLETED,
        priority: DealPriority.MEDIUM,
        dueDate: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000),
        completedAt: new Date(Date.now() - Math.floor(Math.random() * 20) * 24 * 60 * 60 * 1000),
        dealId,
        contactId,
        userId,
        organizationId: orgId,
        createdBy: orgId
      });
      activities.push(pastActivity);

      // Future activity (pending)
      const futureActivity = await Activity.create({
        title: 'Follow-up Meeting',
        description: 'Follow-up meeting to present proposal and discuss next steps',
        type: [ActivityType.MEETING, ActivityType.CALL, ActivityType.EMAIL][Math.floor(Math.random() * 3)],
        status: ActivityStatus.PENDING,
        priority: [DealPriority.LOW, DealPriority.MEDIUM, DealPriority.HIGH][Math.floor(Math.random() * 3)],
        dueDate: new Date(Date.now() + Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000),
        dealId,
        contactId,
        userId,
        organizationId: orgId,
        createdBy: orgId
      });
      activities.push(futureActivity);
    }

    console.log(`✅ Created ${activities.length} activities`);
    return activities;
  }

  async seed() {
    console.log('🌱 Starting database seeding...');
    console.log('=====================================');

    await this.connect();
    await this.clearCollections();

    const users = await this.seedUsers();
    const pipelines = await this.seedPipelines();
    const companies = await this.seedCompanies();
    const contacts = await this.seedContacts();
    const deals = await this.seedDeals();
    const activities = await this.seedActivities();

    console.log('=====================================');
    console.log('🎉 Database seeding completed!');
    console.log(`📊 Summary:`);
    console.log(`   👥 Users: ${users.length}`);
    console.log(`   🔄 Pipelines: ${pipelines.length}`);
    console.log(`   🏢 Companies: ${companies.length}`);
    console.log(`   👤 Contacts: ${contacts.length}`);
    console.log(`   💰 Deals: ${deals.length}`);
    console.log(`   📅 Activities: ${activities.length}`);
    console.log('=====================================');

    // Print login credentials
    console.log('🔑 Login Credentials:');
    for (let i = 0; i < ORGANIZATIONS.length; i++) {
      const org = ORGANIZATIONS[i];
      console.log(`   ${org.name}:`);
      console.log(`     Admin: admin@${org.domain} / admin123`);
      console.log(`     Manager: manager1@${org.domain} / admin123`);
      console.log(`     Sales: sales1@${org.domain} / admin123`);
    }

    await this.disconnect();
  }
}

// Run the seeder
const seeder = new DatabaseSeeder();
seeder.seed().catch((error) => {
  console.error('❌ Seeding failed:', error);
  process.exit(1);
});