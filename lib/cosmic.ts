import { createBucketClient } from '@cosmicjs/sdk'

// Initialize Cosmic client
export const cosmic = createBucketClient({
  bucketSlug: process.env.COSMIC_BUCKET_SLUG as string,
  readKey: process.env.COSMIC_READ_KEY as string,
  writeKey: process.env.COSMIC_WRITE_KEY as string,
})

// Helper function for handling Cosmic errors
function hasStatus(error: unknown): error is { status: number } {
  return typeof error === 'object' && error !== null && 'status' in error;
}

// Fetch salon services from Cosmic
export async function getSalonServices() {
  try {
    const response = await cosmic.objects
      .find({ type: 'services' })
      .props(['title', 'slug', 'metadata'])
      .depth(1);
    
    return response.objects;
  } catch (error) {
    if (hasStatus(error) && error.status === 404) {
      return [];
    }
    console.error('Error fetching salon services:', error);
    throw new Error('Failed to fetch salon services');
  }
}

// Get business settings
export async function getBusinessSettings() {
  try {
    const response = await cosmic.objects
      .findOne({ 
        type: 'settings',
        slug: 'business-settings'
      })
      .props(['title', 'metadata']);
    
    return response.object;
  } catch (error) {
    if (hasStatus(error) && error.status === 404) {
      return null;
    }
    console.error('Error fetching business settings:', error);
    throw new Error('Failed to fetch business settings');
  }
}

// Fetch staff members
export async function getStaffMembers() {
  try {
    const response = await cosmic.objects
      .find({ type: 'staff' })
      .props(['title', 'slug', 'metadata'])
      .depth(1);
    
    return response.objects;
  } catch (error) {
    if (hasStatus(error) && error.status === 404) {
      return [];
    }
    console.error('Error fetching staff members:', error);
    throw new Error('Failed to fetch staff members');
  }
}

// Create appointment record in Cosmic
export async function createAppointmentRecord(appointmentData: {
  clientName: string;
  serviceName: string;
  appointmentDate: string;
  clientId: string;
  status: string;
}) {
  try {
    const response = await cosmic.objects.insertOne({
      type: 'appointments',
      title: `${appointmentData.clientName} - ${appointmentData.serviceName}`,
      metadata: {
        client_id: appointmentData.clientId,
        client_name: appointmentData.clientName,
        service: appointmentData.serviceName,
        appointment_date: appointmentData.appointmentDate,
        status: appointmentData.status
      }
    });
    
    return response.object;
  } catch (error) {
    console.error('Error creating appointment record:', error);
    throw new Error('Failed to create appointment record');
  }
}

// Get notification templates
export async function getNotificationTemplates() {
  try {
    const response = await cosmic.objects
      .find({ type: 'templates' })
      .props(['title', 'slug', 'metadata'])
      .depth(1);
    
    return response.objects;
  } catch (error) {
    if (hasStatus(error) && error.status === 404) {
      return [];
    }
    console.error('Error fetching notification templates:', error);
    throw new Error('Failed to fetch notification templates');
  }
}