"use client"
import React, { useState } from 'react'
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Button } from './ui/button';
import Link from 'next/link';

const CategoryMenuSnack = ({ data }: any) => {
    const [isDialogOpen, setIsDrawerOpen] = useState(false);
    return (
        <>
            <div onClick={() => setIsDrawerOpen(true)} className=' fixed bottom-20 text-white py-2 rounded-full px-4 uppercase text-sm -translate-x-1/2 left-1/2 bg-black font-semibold'>Menu</div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDrawerOpen}>
                <DialogContent showCloseButton={false} className=" max-w-80 sm:max-w-sm py-0">
                    <div className="max-h-96 overflow-auto flex flex-col w-full no-scrollbar divide-y pt-2 text-sm">
                        {
                            data.map((category: any) => (
                                <Link key={category.id} href={`#${category.id}`} onClick={() => setIsDrawerOpen(false)} className=' flex gap-4 justify-between py-2 '>
                                    <h1 className='font-medium'>
                                        {category.name}
                                    </h1>
                                    <p>{category.dishes.length}</p>
                                </Link>
                            ))
                        }
                    </div>
                </DialogContent>
            </Dialog>
        </>

    )
}

export default CategoryMenuSnack;
