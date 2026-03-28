'use server';

import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';

// Type definitions
interface CreateJobData {
    titleAr: string;
    titleEn: string;
    descriptionAr: string;
    descriptionEn: string;
    requirementsAr: string;
    requirementsEn: string;
    location?: string;
    type: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERNSHIP';
}

interface ApplicationData {
    fullName: string;
    email: string;
    phone: string;
    mobile?: string;
    coverLetter?: string;
    cvUrl: string;
    jobId: string;
}

// Simple validation helpers
function validateCreateJob(data: any): { valid: boolean; error?: string; data?: CreateJobData } {
    if (!data.titleAr || data.titleAr.length < 3) return { valid: false, error: 'Arabic title is required (min 3 chars)' };
    if (!data.titleEn || data.titleEn.length < 3) return { valid: false, error: 'English title is required (min 3 chars)' };
    if (!data.descriptionAr || data.descriptionAr.length < 10) return { valid: false, error: 'Arabic description is required (min 10 chars)' };
    if (!data.descriptionEn || data.descriptionEn.length < 10) return { valid: false, error: 'English description is required (min 10 chars)' };
    if (!data.requirementsAr || data.requirementsAr.length < 10) return { valid: false, error: 'Arabic requirements are required (min 10 chars)' };
    if (!data.requirementsEn || data.requirementsEn.length < 10) return { valid: false, error: 'English requirements are required (min 10 chars)' };
    if (!['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP'].includes(data.type)) return { valid: false, error: 'Invalid job type' };

    return {
        valid: true,
        data: {
            titleAr: data.titleAr,
            titleEn: data.titleEn,
            descriptionAr: data.descriptionAr,
            descriptionEn: data.descriptionEn,
            requirementsAr: data.requirementsAr,
            requirementsEn: data.requirementsEn,
            location: data.location || undefined,
            type: data.type,
        }
    };
}

function validateApplication(data: any): { valid: boolean; error?: string; data?: ApplicationData } {
    if (!data.fullName || data.fullName.length < 3) return { valid: false, error: 'Full name is required (min 3 chars)' };
    if (!data.email || !data.email.includes('@')) return { valid: false, error: 'Valid email is required' };
    if (!data.phone || data.phone.length < 8) return { valid: false, error: 'Phone number is required (min 8 chars)' };
    if (!data.cvUrl) return { valid: false, error: 'CV is required' };
    if (!data.jobId) return { valid: false, error: 'Job ID is required' };

    return {
        valid: true,
        data: {
            fullName: data.fullName,
            email: data.email,
            phone: data.phone,
            mobile: data.mobile || undefined,
            coverLetter: data.coverLetter || undefined,
            cvUrl: data.cvUrl,
            jobId: data.jobId,
        }
    };
}

// --- Job Actions ---

export async function createJob(data: any) {
    try {
        const validation = validateCreateJob(data);
        if (!validation.valid) {
            return { success: false, error: validation.error };
        }
        await (prisma as any).jobListing.create({
            data: {
                ...validation.data,
                isActive: true,
            },
        });
        revalidatePath('/dashboard/careers');
        revalidatePath('/careers');
        return { success: true };
    } catch (error) {
        console.error('Create Job Error:', error);
        return { success: false, error: 'Failed to create job' };
    }
}

export async function toggleJobStatus(id: string, isActive: boolean) {
    try {
        await (prisma as any).jobListing.update({
            where: { id },
            data: { isActive },
        });
        revalidatePath('/dashboard/careers');
        revalidatePath('/careers');
        return { success: true };
    } catch (error) {
        return { success: false, error: 'Failed to update status' };
    }
}

export async function getJobs(onlyActive = true) {
    try {
        const where = onlyActive ? { isActive: true } : {};
        const jobs = await (prisma as any).jobListing.findMany({
            where,
            orderBy: { createdAt: 'desc' },
        });
        return { success: true, jobs };
    } catch (error) {
        return { success: false, jobs: [] };
    }
}

export async function getJobById(id: string) {
    try {
        const job = await (prisma as any).jobListing.findUnique({
            where: { id },
        });
        return { success: true, job };
    } catch (error) {
        return { success: false, job: null };
    }
}

// --- Application Actions ---

export async function submitApplication(data: any) {
    try {
        const validation = validateApplication(data);
        if (!validation.valid) {
            return { success: false, error: validation.error };
        }
        await (prisma as any).jobApplication.create({
            data: validation.data,
        });
        return { success: true };
    } catch (error) {
        console.error('Application Error:', error);
        return { success: false, error: 'Failed to submit application' };
    }
}

export async function getApplications(jobId?: string) {
    try {
        const where = jobId ? { jobId } : {};
        const applications = await (prisma as any).jobApplication.findMany({
            where,
            include: { job: true },
            orderBy: { createdAt: 'desc' },
        });
        return { success: true, applications };
    } catch (error) {
        return { success: false, applications: [] };
    }
}

export async function updateApplicationStatus(id: string, status: string) {
    try {
        await (prisma as any).jobApplication.update({
            where: { id },
            data: { status },
        });
        revalidatePath('/dashboard/careers/applications');
        return { success: true };
    } catch (error) {
        return { success: false, error: 'Failed to update status' };
    }
}
