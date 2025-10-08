import dotenv from 'dotenv'
import connectDB from '../config/database'
import { Shipment, FieldsConfig, PaymentStatus, ShipmentStatus } from '../models'

// Load environment variables
dotenv.config()

const sampleShipments = [
  {
    date: new Date('2024-01-15'),
    pickupCustomerName: 'Rajesh Kumar',
    pickupCustomerMoNo: '+91-9876543210',
    pickupRef: 'PU001',
    awb: 'AWB2024001',
    courierPartner: 'Blue Dart',
    weight: 2.5,
    pinCode: '400001',
    city: 'Mumbai',
    state: 'Maharashtra',
    bookingCode: 'BK001',
    baseAmount: 150,
    royaltyMargin: 30,
    gst: 27,
    saleCost: 200,
    customerName: 'Priya Sharma',
    customerMoNo: '+91-9123456789',
    paymentStatus: PaymentStatus.PAID,
    shipmentStatus: ShipmentStatus.DELIVERED,
    createdBy: 'seeder',
    updatedBy: 'seeder'
  },
  {
    date: new Date('2024-01-16'),
    pickupCustomerName: 'Amit Singh',
    pickupCustomerMoNo: '+91-9876543211',
    pickupRef: 'PU002',
    awb: 'AWB2024002',
    courierPartner: 'FedEx',
    weight: 1.8,
    pinCode: '110001',
    city: 'Delhi',
    state: 'Delhi',
    bookingCode: 'BK002',
    baseAmount: 120,
    royaltyMargin: 25,
    gst: 22,
    saleCost: 180,
    customerName: 'Neha Gupta',
    customerMoNo: '+91-9123456788',
    paymentStatus: PaymentStatus.PENDING,
    shipmentStatus: ShipmentStatus.IN_TRANSIT,
    createdBy: 'seeder',
    updatedBy: 'seeder'
  },
  {
    date: new Date('2024-01-17'),
    pickupCustomerName: 'Suresh Patel',
    pickupCustomerMoNo: '+91-9876543212',
    pickupRef: 'PU003',
    awb: 'AWB2024003',
    courierPartner: 'DTDC',
    weight: 3.2,
    pinCode: '560001',
    city: 'Bangalore',
    state: 'Karnataka',
    bookingCode: 'BK003',
    baseAmount: 180,
    royaltyMargin: 35,
    gst: 32,
    saleCost: 250,
    customerName: 'Ravi Reddy',
    customerMoNo: '+91-9123456787',
    paymentStatus: PaymentStatus.PARTIAL,
    shipmentStatus: ShipmentStatus.PICKED,
    createdBy: 'seeder',
    updatedBy: 'seeder'
  },
  {
    date: new Date('2024-01-18'),
    pickupCustomerName: 'Deepak Joshi',
    pickupCustomerMoNo: '+91-9876543213',
    pickupRef: 'PU004',
    awb: 'AWB2024004',
    courierPartner: 'Delhivery',
    weight: 0.8,
    pinCode: '600001',
    city: 'Chennai',
    state: 'Tamil Nadu',
    bookingCode: 'BK004',
    baseAmount: 80,
    royaltyMargin: 15,
    gst: 14,
    saleCost: 120,
    customerName: 'Lakshmi Iyer',
    customerMoNo: '+91-9123456786',
    paymentStatus: PaymentStatus.PAID,
    shipmentStatus: ShipmentStatus.DELIVERED,
    createdBy: 'seeder',
    updatedBy: 'seeder'
  },
  {
    date: new Date('2024-01-19'),
    pickupCustomerName: 'Vikram Mehta',
    pickupCustomerMoNo: '+91-9876543214',
    pickupRef: 'PU005',
    awb: 'AWB2024005',
    courierPartner: 'Ecom Express',
    weight: 4.5,
    pinCode: '700001',
    city: 'Kolkata',
    state: 'West Bengal',
    bookingCode: 'BK005',
    baseAmount: 220,
    royaltyMargin: 45,
    gst: 40,
    saleCost: 320,
    customerName: 'Anita Das',
    customerMoNo: '+91-9123456785',
    paymentStatus: PaymentStatus.REFUNDED,
    shipmentStatus: ShipmentStatus.RTS,
    createdBy: 'seeder',
    updatedBy: 'seeder'
  },
  {
    date: new Date('2024-01-20'),
    pickupCustomerName: 'Manoj Agarwal',
    pickupCustomerMoNo: '+91-9876543215',
    pickupRef: 'PU006',
    awb: 'AWB2024006',
    courierPartner: 'Blue Dart',
    weight: 1.2,
    pinCode: '380001',
    city: 'Ahmedabad',
    state: 'Gujarat',
    bookingCode: 'BK006',
    baseAmount: 100,
    royaltyMargin: 20,
    gst: 18,
    saleCost: 150,
    customerName: 'Kavita Shah',
    customerMoNo: '+91-9123456784',
    paymentStatus: PaymentStatus.PENDING,
    shipmentStatus: ShipmentStatus.CREATED,
    createdBy: 'seeder',
    updatedBy: 'seeder'
  },
  {
    date: new Date('2024-01-21'),
    pickupCustomerName: 'Rohit Verma',
    pickupCustomerMoNo: '+91-9876543216',
    pickupRef: 'PU007',
    awb: 'AWB2024007',
    courierPartner: 'FedEx',
    weight: 2.8,
    pinCode: '500001',
    city: 'Hyderabad',
    state: 'Telangana',
    bookingCode: 'BK007',
    baseAmount: 160,
    royaltyMargin: 32,
    gst: 29,
    saleCost: 230,
    customerName: 'Sunita Rao',
    customerMoNo: '+91-9123456783',
    paymentStatus: PaymentStatus.PAID,
    shipmentStatus: ShipmentStatus.IN_TRANSIT,
    createdBy: 'seeder',
    updatedBy: 'seeder'
  },
  {
    date: new Date('2024-01-22'),
    pickupCustomerName: 'Ashok Bansal',
    pickupCustomerMoNo: '+91-9876543217',
    pickupRef: 'PU008',
    awb: 'AWB2024008',
    courierPartner: 'DTDC',
    weight: 1.5,
    pinCode: '411001',
    city: 'Pune',
    state: 'Maharashtra',
    bookingCode: 'BK008',
    baseAmount: 110,
    royaltyMargin: 22,
    gst: 20,
    saleCost: 165,
    customerName: 'Meera Jain',
    customerMoNo: '+91-9123456782',
    paymentStatus: PaymentStatus.PARTIAL,
    shipmentStatus: ShipmentStatus.PICKED,
    createdBy: 'seeder',
    updatedBy: 'seeder'
  },
  {
    date: new Date('2024-01-23'),
    pickupCustomerName: 'Sanjay Gupta',
    pickupCustomerMoNo: '+91-9876543218',
    pickupRef: 'PU009',
    awb: 'AWB2024009',
    courierPartner: 'Delhivery',
    weight: 3.8,
    pinCode: '302001',
    city: 'Jaipur',
    state: 'Rajasthan',
    bookingCode: 'BK009',
    baseAmount: 190,
    royaltyMargin: 38,
    gst: 34,
    saleCost: 280,
    customerName: 'Pooja Agarwal',
    customerMoNo: '+91-9123456781',
    paymentStatus: PaymentStatus.PAID,
    shipmentStatus: ShipmentStatus.DELIVERED,
    createdBy: 'seeder',
    updatedBy: 'seeder'
  },
  {
    date: new Date('2024-01-24'),
    pickupCustomerName: 'Kiran Nair',
    pickupCustomerMoNo: '+91-9876543219',
    pickupRef: 'PU010',
    awb: 'AWB2024010',
    courierPartner: 'Ecom Express',
    weight: 2.1,
    pinCode: '682001',
    city: 'Kochi',
    state: 'Kerala',
    bookingCode: 'BK010',
    baseAmount: 130,
    royaltyMargin: 26,
    gst: 23,
    saleCost: 190,
    customerName: 'Arjun Pillai',
    customerMoNo: '+91-9123456780',
    paymentStatus: PaymentStatus.PENDING,
    shipmentStatus: ShipmentStatus.CANCELLED,
    createdBy: 'seeder',
    updatedBy: 'seeder'
  }
]

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...')

    // Connect to database
    await connectDB()

    // Clear existing data
    console.log('🧹 Clearing existing data...')
    await Shipment.deleteMany({})
    await FieldsConfig.deleteMany({})

    // Initialize field configurations
    console.log('⚙️ Initializing field configurations...')
    const defaultConfigs = (FieldsConfig as any).getDefaultConfigs()
    await FieldsConfig.insertMany(defaultConfigs)
    console.log(`✅ Created ${defaultConfigs.length} field configurations`)

    // Seed shipments (save individually to trigger pre-save middleware)
    console.log('📦 Seeding shipments...')
    for (const shipmentData of sampleShipments) {
      const shipment = new Shipment(shipmentData)
      await shipment.save()
    }
    console.log(`✅ Created ${sampleShipments.length} sample shipments`)

    // Display summary
    const shipmentCount = await Shipment.countDocuments()
    const fieldConfigCount = await FieldsConfig.countDocuments()
    
    console.log('\n📊 Seeding Summary:')
    console.log(`   Shipments: ${shipmentCount}`)
    console.log(`   Field Configurations: ${fieldConfigCount}`)
    
    // Calculate some stats
    const totalAmount = await Shipment.aggregate([
      { $group: { _id: null, total: { $sum: '$grandTotal' } } }
    ])
    
    const statusBreakdown = await Shipment.aggregate([
      { $group: { _id: '$shipmentStatus', count: { $sum: 1 } } }
    ])

    console.log(`   Total Amount: ₹${totalAmount[0]?.total?.toLocaleString() || 0}`)
    console.log('   Status Breakdown:')
    statusBreakdown.forEach(item => {
      console.log(`     ${item._id}: ${item.count}`)
    })

    console.log('\n🎉 Database seeding completed successfully!')
    process.exit(0)

  } catch (error) {
    console.error('❌ Error seeding database:', error)
    process.exit(1)
  }
}

// Run seeding if this file is executed directly
if (require.main === module) {
  seedDatabase()
}

export default seedDatabase
