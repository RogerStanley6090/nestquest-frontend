// @vitest-environment jsdom
import { describe, test, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'

import IdentificationGuide from '../IdentificationGuide.jsx'


const { mockNavigate } = vi.hoisted(() => ({
  mockNavigate: vi.fn(),
}))


vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')

  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})


function startGuide() {
  render(<IdentificationGuide />)

  fireEvent.click(
    screen.getByRole('button', {
      name: /I understand/i,
    })
  )
}


function answerAndNext(answer) {
  fireEvent.click(
    screen.getByRole('button', {
      name: answer,
    })
  )

  const nextButton =
    screen.queryByRole('button', { name: 'Next' }) ||
    screen.getByRole('button', { name: 'See likely match' })

  fireEvent.click(nextButton)
}


describe('Sprint 4 Identification Guide Component Tests', () => {

  beforeEach(() => {
    mockNavigate.mockClear()
  })


  // ---------------------------------------------------------
  // TC-29 Grey Warbler Priority Matching Component Test
  // ---------------------------------------------------------
  test('TC-29 Grey Warbler priority matching', () => {

    startGuide()

    answerAndNext('Enclosed dome / hanging pouch')
    answerAndNext('Small / about palm-sized')
    answerAndNext('In a fork')
    answerAndNext('No, open top')
    answerAndNext('Small cup with grasses')

    expect(
      screen.getByText(/Grey Warbler \/ Riroriro/i)
    ).toBeTruthy()
  })


  // ---------------------------------------------------------
  // TC-30 Unknown Result Component Test
  // ---------------------------------------------------------
  test('TC-30 Unknown result', () => {

    startGuide()

    answerAndNext('Not sure')
    answerAndNext('Not sure')
    answerAndNext('Not sure')
    answerAndNext('Cannot tell')
    answerAndNext("Not sure / can't tell")

    expect(
      screen.getByText("That's not my nest")
    ).toBeTruthy()
  })


  // ---------------------------------------------------------
  // TC-31 Guide Reset State Component Test
  // ---------------------------------------------------------
  test('TC-31 Guide reset state', () => {
    startGuide()
    answerAndNext('Enclosed dome / hanging pouch')
    answerAndNext('Small / about palm-sized')
    answerAndNext('Hanging / suspended')
    answerAndNext('Yes, side entrance')
    answerAndNext("Not sure / can't tell")
    fireEvent.click(
      screen.getByRole('button', {
        name: /That's not my nest \/ Start again/i,
      })
    )
    expect(
      screen.getByText('Step 1 of 5')
    ).toBeTruthy()
    expect(
      screen.getByText('What shape is the nest?')
    ).toBeTruthy()
    const nextButton = screen.getByRole('button', {
      name: 'Next',
    })
    expect(nextButton.disabled).toBe(true)
  })

  // ---------------------------------------------------------
  // TC-32 Guide Result Data Transfer Component Test
  // ---------------------------------------------------------
  test('TC-32 Guide result data transfer', () => {
    startGuide()
    answerAndNext('Open cup or bowl')
    answerAndNext('Small / about palm-sized')
    answerAndNext('In a fork')
    answerAndNext('No, open top')
    answerAndNext('Small cup with grasses')
    fireEvent.click(
      screen.getByRole('button', {
        name: /Submit this nest report/i,
      })
    )
    expect(mockNavigate).toHaveBeenCalledWith(
      '/report',
      {
        state: {
          guideAnswers: expect.objectContaining({
            nest_shape: 'Open cup or bowl',
            size_category: 'Small / about palm-sized',
            position_type: 'In a fork',
            entrance_visible: 'No, open top',
            inside_visible: 'Small cup with grasses',
            key_result: 'silvereye',
            user_clicked_not_my_nest: 'no',
            confidence_level: 'medium',
            researcher_final_id: 'pending',
            verification_status: 'unverified',
          }),
        },
      }
    )
  })

})