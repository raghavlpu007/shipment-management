import { Shipment, PaymentStatus, ShipmentStatus } from '../../models'

describe('Shipment Model', () => {
  const validShipmentData = {
    date: new Date(),
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

  it('should create a valid shipment', async () => {
    const shipment = new Shipment(validShipmentData)
    const savedShipment = await shipment.save()

    expect(savedShipment._id).toBeDefined()
    expect(savedShipment.awb).toBe(validShipmentData.awb)
    expect(savedShipment.totalBeforeGst).toBe(120) // baseAmount + royaltyMargin
    expect(savedShipment.totalAfterGst).toBe(138) // totalBeforeGst + gst
    expect(savedShipment.grandTotal).toBe(138) // same as totalAfterGst
  })

  it('should calculate derived fields correctly', async () => {
    const shipment = new Shipment({
      ...validShipmentData,
      baseAmount: 200,
      royaltyMargin: 50,
      gst: 45
    })
    
    await shipment.save()

    expect(shipment.totalBeforeGst).toBe(250)
    expect(shipment.totalAfterGst).toBe(295)
    expect(shipment.grandTotal).toBe(295)
  })

  it('should require mandatory fields', async () => {
    const shipment = new Shipment({})
    
    await expect(shipment.save()).rejects.toThrow()
  })

  it('should validate phone number format', async () => {
    const shipment = new Shipment({
      ...validShipmentData,
      pickupCustomerMoNo: 'invalid-phone'
    })
    
    await expect(shipment.save()).rejects.toThrow()
  })

  it('should validate pincode format', async () => {
    const shipment = new Shipment({
      ...validShipmentData,
      pinCode: '12345' // Only 5 digits
    })
    
    await expect(shipment.save()).rejects.toThrow()
  })

  it('should validate negative amounts', async () => {
    const shipment = new Shipment({
      ...validShipmentData,
      baseAmount: -100
    })
    
    await expect(shipment.save()).rejects.toThrow()
  })

  it('should enforce unique AWB numbers', async () => {
    const shipment1 = new Shipment(validShipmentData)
    await shipment1.save()

    const shipment2 = new Shipment({
      ...validShipmentData,
      awb: validShipmentData.awb // Same AWB
    })
    
    await expect(shipment2.save()).rejects.toThrow()
  })

  it('should set default status values', async () => {
    const shipment = new Shipment({
      ...validShipmentData,
      paymentStatus: undefined,
      shipmentStatus: undefined
    })
    
    await shipment.save()

    expect(shipment.paymentStatus).toBe(PaymentStatus.PENDING)
    expect(shipment.shipmentStatus).toBe(ShipmentStatus.CREATED)
  })

  it('should handle additional fields', async () => {
    const additionalFields = new Map([
      ['customField1', 'value1'],
      ['customField2', 123]
    ])

    const shipment = new Shipment({
      ...validShipmentData,
      additionalFields
    })
    
    await shipment.save()

    expect(shipment.additionalFields.get('customField1')).toBe('value1')
    expect(shipment.additionalFields.get('customField2')).toBe(123)
  })
})
