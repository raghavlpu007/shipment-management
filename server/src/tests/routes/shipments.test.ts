import request from 'supertest'
import app from '../../index'
import { Shipment, PaymentStatus, ShipmentStatus } from '../../models'

describe('Shipments API', () => {
  const validShipmentData = {
    date: '2024-01-15',
    pickupCustomerName: 'John Doe',
    pickupCustomerMoNo: '+1234567890',
    pickupRef: 'REF123',
    awb: 'AWB123456789',
    courierPartner: 'FedEx',
    weight: 2.5,
    pinCode: '123456',
    city: 'Mumbai',
    state: 'Maharashtra',
    bookingCode: 'BOOK123',
    baseAmount: 100,
    royaltyMargin: 20,
    gst: 18,
    saleCost: 150,
    customerName: 'Jane Smith',
    customerMoNo: '+0987654321',
    paymentStatus: PaymentStatus.PENDING,
    shipmentStatus: ShipmentStatus.CREATED,
    createdBy: 'test',
    updatedBy: 'test'
  }

  describe('POST /api/shipments', () => {
    it('should create a new shipment', async () => {
      const response = await request(app)
        .post('/api/shipments')
        .send(validShipmentData)
        .expect(201)

      expect(response.body.success).toBe(true)
      expect(response.body.data.awb).toBe(validShipmentData.awb)
      expect(response.body.data.totalBeforeGst).toBe(120)
      expect(response.body.data.grandTotal).toBe(138)
    })

    it('should return validation error for invalid data', async () => {
      const invalidData = {
        ...validShipmentData,
        pickupCustomerMoNo: 'invalid-phone'
      }

      const response = await request(app)
        .post('/api/shipments')
        .send(invalidData)
        .expect(400)

      expect(response.body.success).toBe(false)
      expect(response.body.error).toContain('Validation error')
    })

    it('should return error for missing required fields', async () => {
      const incompleteData = {
        awb: 'AWB123'
      }

      const response = await request(app)
        .post('/api/shipments')
        .send(incompleteData)
        .expect(400)

      expect(response.body.success).toBe(false)
    })
  })

  describe('GET /api/shipments', () => {
    beforeEach(async () => {
      // Create test shipments
      await Shipment.create([
        { ...validShipmentData, awb: 'AWB001' },
        { ...validShipmentData, awb: 'AWB002', city: 'Delhi' },
        { ...validShipmentData, awb: 'AWB003', paymentStatus: PaymentStatus.PAID }
      ])
    })

    it('should get all shipments with pagination', async () => {
      const response = await request(app)
        .get('/api/shipments')
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data).toHaveLength(3)
      expect(response.body.pagination).toBeDefined()
      expect(response.body.pagination.totalItems).toBe(3)
    })

    it('should filter shipments by payment status', async () => {
      const response = await request(app)
        .get('/api/shipments?paymentStatus=Paid')
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data).toHaveLength(1)
      expect(response.body.data[0].paymentStatus).toBe(PaymentStatus.PAID)
    })

    it('should search shipments by text', async () => {
      const response = await request(app)
        .get('/api/shipments?search=Delhi')
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data).toHaveLength(1)
      expect(response.body.data[0].city).toBe('Delhi')
    })

    it('should paginate results', async () => {
      const response = await request(app)
        .get('/api/shipments?page=1&limit=2')
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data).toHaveLength(2)
      expect(response.body.pagination.currentPage).toBe(1)
      expect(response.body.pagination.hasNextPage).toBe(true)
    })
  })

  describe('GET /api/shipments/:id', () => {
    let shipmentId: string

    beforeEach(async () => {
      const shipment = await Shipment.create(validShipmentData)
      shipmentId = shipment._id.toString()
    })

    it('should get shipment by ID', async () => {
      const response = await request(app)
        .get(`/api/shipments/${shipmentId}`)
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data._id).toBe(shipmentId)
      expect(response.body.data.awb).toBe(validShipmentData.awb)
    })

    it('should return 404 for non-existent shipment', async () => {
      const fakeId = '507f1f77bcf86cd799439011'
      
      const response = await request(app)
        .get(`/api/shipments/${fakeId}`)
        .expect(404)

      expect(response.body.success).toBe(false)
    })
  })

  describe('PUT /api/shipments/:id', () => {
    let shipmentId: string

    beforeEach(async () => {
      const shipment = await Shipment.create(validShipmentData)
      shipmentId = shipment._id.toString()
    })

    it('should update shipment', async () => {
      const updateData = {
        customerName: 'Updated Customer',
        baseAmount: 200
      }

      const response = await request(app)
        .put(`/api/shipments/${shipmentId}`)
        .send(updateData)
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data.customerName).toBe('Updated Customer')
      expect(response.body.data.totalBeforeGst).toBe(220) // 200 + 20
    })

    it('should return 404 for non-existent shipment', async () => {
      const fakeId = '507f1f77bcf86cd799439011'
      
      const response = await request(app)
        .put(`/api/shipments/${fakeId}`)
        .send({ customerName: 'Test' })
        .expect(404)

      expect(response.body.success).toBe(false)
    })
  })

  describe('DELETE /api/shipments/:id', () => {
    let shipmentId: string

    beforeEach(async () => {
      const shipment = await Shipment.create(validShipmentData)
      shipmentId = shipment._id.toString()
    })

    it('should delete shipment', async () => {
      const response = await request(app)
        .delete(`/api/shipments/${shipmentId}`)
        .expect(200)

      expect(response.body.success).toBe(true)

      // Verify shipment is deleted
      const deletedShipment = await Shipment.findById(shipmentId)
      expect(deletedShipment).toBeNull()
    })

    it('should return 404 for non-existent shipment', async () => {
      const fakeId = '507f1f77bcf86cd799439011'
      
      const response = await request(app)
        .delete(`/api/shipments/${fakeId}`)
        .expect(404)

      expect(response.body.success).toBe(false)
    })
  })

  describe('GET /api/shipments/stats/summary', () => {
    beforeEach(async () => {
      await Shipment.create([
        { ...validShipmentData, awb: 'AWB001', grandTotal: 100 },
        { ...validShipmentData, awb: 'AWB002', grandTotal: 200 },
        { ...validShipmentData, awb: 'AWB003', grandTotal: 300, paymentStatus: PaymentStatus.PAID }
      ])
    })

    it('should get shipment statistics', async () => {
      const response = await request(app)
        .get('/api/shipments/stats/summary')
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data.summary.totalShipments).toBe(3)
      expect(response.body.data.summary.totalAmount).toBe(600)
      expect(response.body.data.statusBreakdown).toBeDefined()
      expect(response.body.data.paymentBreakdown).toBeDefined()
    })
  })
})
