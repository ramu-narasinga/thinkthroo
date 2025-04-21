import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { createClient } from '@sanity/client'
import dotenv from 'dotenv'

dotenv.config()

const contentDir = path.join('C:\\Users\\Divya Ramu\\OneDrive\\Documents\\thinkthroo\\thinkthroo\\apps\\www\\content\\test-import')

const sanity = createClient({
    projectId: process.env.SANITY_PROJECT_ID,
    dataset: process.env.SANITY_DATASET,
    token: process.env.SANITY_API_TOKEN,
    useCdn: false,
    apiVersion: '2023-01-01',
})

const AUTHOR = 'Ramu Narasinga'
const CATEGORIES = ['Blog']

async function getReferenceId(type, name) {
    return await sanity.fetch(`*[_type == $type && name == $name][0]._id`, { type, name })
}

async function importPosts() {

    const authorId = await getReferenceId('author', AUTHOR)
    if (!authorId) {
        console.error(`❌ Author not found: ${AUTHOR}`)
        process.exit(1)
    }

    const categoryIds = await Promise.all(
        CATEGORIES.map(async (name) => {
            const id = await getReferenceId('category', name)
            if (!id) console.warn(`⚠️ Category not found: ${name}`)
            return id
        })
    ).then(ids => ids.filter(Boolean))

    const files = fs.readdirSync(contentDir).filter(file => file.endsWith('.mdx'))

    for (const file of files) {
        const filePath = path.join(contentDir, file)
        const fileContent = fs.readFileSync(filePath, 'utf8')
        const { data, content } = matter(fileContent)

        const doc = {
            _type: 'post',
            title: data.title,
            slug: { _type: 'slug', current: path.parse(file).name },
            publishedAt: new Date().toISOString(),
            body: content,
            author: {
                _type: 'reference',
                _ref: authorId,
            },
            categories: categoryIds.map(id => ({ _type: 'reference', _ref: id })),
            // Optionally map mainImage here if data contains them
        }

        try {
            const created = await sanity.create(doc)
            console.log(`✅ Imported: ${created.title}`)
        } catch (err) {
            console.error(`❌ Failed to import ${file}:`, err.message)
        }
    }
}

importPosts()
